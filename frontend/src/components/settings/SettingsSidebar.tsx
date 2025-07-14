import React from "react";

const settingsLinks = [
  { label: "My Account", active: true },
  { label: "Profiles" },
  { label: "Content & Social" },
  { label: "Data & Privacy" },
  { label: "Family Center" },
  { label: "Authorized Apps" },
  { label: "Devices" },
  { label: "Connections" },
  { label: "Clips" },
];

const billingLinks = [
  { label: "Nitro", badge: "OFFER" },
  { label: "Server Boost" },
  { label: "Subscriptions" },
];

export default function SettingsSidebar() {
  return (
    <aside className="w-72 bg-[#23272a] h-full p-6 flex flex-col border-r border-[#23272a]">
      <br></br>
      <div className="text-xs text-gray-400 mb-2 mt-4">USER SETTINGS</div>
      <nav className="flex flex-col gap-1">
        {settingsLinks.map(link => (
          <button
            key={link.label}
            className={`text-left px-3 py-2 rounded font-medium text-sm transition-colors ${link.active ? "bg-[#313338] text-white" : "text-gray-300 hover:bg-[#23272a]"}`}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-[#23272a] my-4" />
      <div className="text-xs text-gray-400 mb-2">BILLING SETTINGS</div>
      <nav className="flex flex-col gap-1">
        {billingLinks.map(link => (
          <button
            key={link.label}
            className="text-left px-3 py-2 rounded font-medium text-sm text-gray-300 hover:bg-[#23272a] flex items-center gap-2"
          >
            {link.label}
            {link.badge && (
              <span className="ml-2 bg-pink-500 text-xs px-2 py-0.5 rounded-full">{link.badge}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
} 