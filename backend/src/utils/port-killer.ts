/**
 * Port killer utility
 * 
 * Kills any process using the specified port
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logInfo, logWarn } from './logger';

const execAsync = promisify(exec);

/**
 * Get process ID using the specified port
 */
async function getProcessIdOnPort(port: number): Promise<number | null> {
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows: netstat -ano | findstr :5000
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      
      if (lines.length > 0) {
        // Extract PID from the last column
        const lastLine = lines[0].trim();
        const parts = lastLine.split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && !isNaN(parseInt(pid, 10))) {
          return parseInt(pid, 10);
        }
      }
    } else {
      // macOS/Linux: lsof -ti :5000
      try {
        const { stdout } = await execAsync(`lsof -ti :${port}`);
        const pid = stdout.trim();
        
        if (pid && !isNaN(parseInt(pid, 10))) {
          return parseInt(pid, 10);
        }
      } catch (error) {
        // No process found on port
        return null;
      }
    }
    
    return null;
  } catch (error) {
    // Port might not be in use
    return null;
  }
}

/**
 * Kill process by ID
 */
async function killProcess(pid: number): Promise<boolean> {
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows: taskkill /PID <pid> /F
      await execAsync(`taskkill /PID ${pid} /F`);
    } else {
      // macOS/Linux: kill -9 <pid>
      // First try graceful kill, then force kill
      try {
        await execAsync(`kill ${pid}`);
        // Wait a moment for graceful shutdown
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Check if process still exists
        try {
          await execAsync(`kill -0 ${pid}`);
          // Process still exists, force kill
          await execAsync(`kill -9 ${pid}`);
        } catch {
          // Process already dead, good
        }
      } catch (error) {
        // Try force kill if graceful kill fails
        await execAsync(`kill -9 ${pid}`);
      }
    }
    
    return true;
  } catch (error) {
    // Check if process was actually killed
    try {
      await execAsync(`kill -0 ${pid}`);
      // Process still exists
      return false;
    } catch {
      // Process doesn't exist anymore, assume killed
      return true;
    }
  }
}

/**
 * Check if AirPlay Receiver is enabled (macOS only)
 */
async function isAirPlayEnabled(): Promise<boolean> {
  if (process.platform !== 'darwin') {
    return false;
  }
  
  try {
    const { stdout } = await execAsync('defaults read com.apple.controlcenter.plist AirplayRecieverEnabled 2>/dev/null || echo "0"');
    return stdout.trim() === '1';
  } catch {
    return false;
  }
}

/**
 * Disable AirPlay Receiver (macOS only)
 */
async function disableAirPlay(): Promise<boolean> {
  if (process.platform !== 'darwin') {
    return false;
  }
  
  try {
    await execAsync('defaults write com.apple.controlcenter.plist AirplayRecieverEnabled -bool false');
    await execAsync('killall ControlCenter 2>/dev/null || true');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  } catch {
    return false;
  }
}

/**
 * Kill any process using the specified port
 * 
 * @param port - Port number to free
 * @returns true if a process was killed, false if port was already free
 */
export async function killProcessOnPort(port: number): Promise<boolean> {
  try {
    // Try multiple times to kill processes on the port
    // Some processes (like macOS AirPlay) restart automatically
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const pid = await getProcessIdOnPort(port);
      
      if (!pid) {
        // Port is free, wait a moment to ensure it stays free
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        // Double-check it's still free
        const stillFree = !(await getProcessIdOnPort(port));
        if (stillFree) {
          if (attempts > 0) {
            logInfo(`Port ${port} is now free after ${attempts} attempt(s)`);
          } else {
            logInfo(`Port ${port} is free`);
          }
          return attempts > 0;
        }
      }
      
      if (pid) {
        logWarn(`Found process ${pid} using port ${port}, killing it... (attempt ${attempts + 1}/${maxAttempts})`);
        
        const killed = await killProcess(pid);
        
        if (killed) {
          logInfo(`Successfully killed process ${pid}`);
          
          // Wait for the port to be released
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          logWarn(`Failed to kill process ${pid} on port ${port}`);
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      
      attempts++;
    }
    
    // Final check
    const finalPid = await getProcessIdOnPort(port);
    if (finalPid) {
      // Check if AirPlay is enabled (macOS only)
      if (process.platform === 'darwin' && await isAirPlayEnabled()) {
        logWarn(`Port ${port} is still in use. AirPlay Receiver is enabled.`);
        logWarn('Attempting to disable AirPlay Receiver...');
        
        const disabled = await disableAirPlay();
        if (disabled) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const stillBlocked = await getProcessIdOnPort(port);
          if (!stillBlocked) {
            logInfo('AirPlay Receiver disabled. Port is now free.');
            return true;
          }
        }
        
        logWarn('Failed to automatically disable AirPlay Receiver.');
        logWarn('Please disable it manually: System Preferences > General > AirDrop & Handoff');
      } else {
        logWarn(`Port ${port} is still in use by process ${finalPid} after ${maxAttempts} attempts`);
        logWarn('This may be a system process that cannot be killed.');
      }
      return false;
    }
    
    return true;
  } catch (error) {
    logWarn(`Error checking port ${port}:`, error);
    return false;
  }
}

