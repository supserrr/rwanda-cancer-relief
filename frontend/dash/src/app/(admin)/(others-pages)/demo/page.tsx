import type { Metadata } from "next";
import MultiSelect from "@/components/form/MultiSelect";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Demo | Rwanda Cancer Relief Admin",
  description:
    "Demo page showcasing the Rwanda Cancer Relief admin dashboard components and features",
};

/**
 * Demo page showcasing the admin dashboard components.
 *
 * This page demonstrates the available dashboard components including:
 * - Multi-select form components
 * - Basic UI elements
 *
 * @returns Demo page with dashboard component showcase
 */
export default function DashboardDemo() {
  const sampleOptions = [
    { value: "option1", text: "Patient Management", selected: false },
    { value: "option2", text: "Analytics & Reporting", selected: false },
    { value: "option3", text: "Resource Tracking", selected: false },
    { value: "option4", text: "Appointment Scheduling", selected: false },
    { value: "option5", text: "Counselor Management", selected: false },
    { value: "option6", text: "Support Groups", selected: false },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demo page showcasing the Rwanda Cancer Relief admin dashboard components and features
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Multi-Select Component Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Multi-Select Component
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Interactive multi-select dropdown for selecting multiple options
          </p>
          
          <div className="max-w-md">
            <MultiSelect
              label="Dashboard Features"
              options={sampleOptions}
              defaultSelected={["option1", "option3"]}
              onChange={(selected) => console.log("Selected:", selected)}
            />
          </div>
        </div>

        {/* Feature Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Dashboard Features
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Rwanda Cancer Relief Admin Dashboard Overview
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Patient Management
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track patient records, treatment plans, and medical history
                with comprehensive data management tools.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Analytics & Reporting
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate detailed reports on treatment outcomes, resource
                allocation, and program effectiveness.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Resource Tracking
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor medical supplies, equipment availability, and
                financial resources in real-time.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Appointment Scheduling
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage screening appointments, treatment sessions, and
                follow-up visits with integrated calendar tools.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Additional dashboard components will be added in future updates:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Metrics cards with statistics</li>
            <li>Interactive charts and visualizations</li>
            <li>Data tables with pagination</li>
            <li>Alert and notification components</li>
            <li>Button and badge components</li>
            <li>Advanced form components</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

