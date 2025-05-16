"use client"

import React from 'react';

// Sample security logs data
const securityLogs = [
  {
    id: "LOG001",
    event: "login_success",
    user: {
      name: "Admin User",
      email: "admin@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    ipAddress: "192.168.1.1",
    location: "New York, USA",
    device: "Chrome / Windows",
    timestamp: "2023-10-17T10:30:00Z",
    details: "Successful login",
  },
  {
    id: "LOG002",
    event: "login_failed",
    user: {
      name: "Unknown",
      email: "unknown@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    ipAddress: "203.0.113.1",
    location: "Beijing, China",
    device: "Safari / macOS",
    timestamp: "2023-10-17T09:15:00Z",
    details: "Failed login attempt (incorrect password)",
  },
  {
    id: "LOG003",
    event: "password_reset",
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    ipAddress: "10.0.0.1",
    location: "London, UK",
    device: "Firefox / Linux",
    timestamp: "2023-10-17T08:45:00Z",
    details: "Password reset requested",
  },
  {
    id: "LOG004",
    event: "2fa_enabled",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    ipAddress: "172.16.0.1",
    location: "Sydney, Australia",
    device: "Edge / Windows",
    timestamp: "2023-10-17T07:30:00Z",
    details: "Two-factor authentication enabled",
  }
];

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Logs</h1>
        <p className="text-gray-600 mt-2">Monitor and review system security events</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {securityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.event === 'login_success' ? 'bg-green-100 text-green-800' :
                      log.event === 'login_failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.event.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={log.user.avatar}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

