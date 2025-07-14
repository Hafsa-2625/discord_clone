import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-[#23272a] text-white relative">
      {/* Back button */}
      <button
        className="absolute top-6 left-6 z-10 flex items-center gap-1 text-gray-300 hover:text-white bg-[#23272a] rounded-full p-2 shadow"
        onClick={() => navigate('/home')}
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} />
      </button>
      <SettingsSidebar />
      {/* Main settings content goes here */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        {/* Add your settings UI here, styled as in your image */}
      </div>
    </div>
  );
}