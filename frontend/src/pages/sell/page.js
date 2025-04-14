import React, { useState } from "react";
import Activity from "./includes/activity";
import Messages from "./includes/messages";
import Account from "./includes/account";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";

const Sell = () => {
  const [activeTab, setActiveTab] = useState("Activity");

  // Map tab names to their respective components
  const tabComponents = {
    Activity: <Activity />,
    Messages: <Messages />,
    Account: <Account />,
  };

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      {/* Header Section from MainLayout */}
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      {/* Main Content */}
      <div className="flex p-4">
        {/* Main Content Area */}
        <div className="w-3/4 pr-4">
          <h1 className="text-2xl font-bold mb-4">My eBay</h1>
          <div className="flex space-x-4 mb-4">
            {["Activity", "Messages", "Account"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`p-2 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-700 hover:text-blue-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Render the selected tab's component */}
          <div>{tabComponents[activeTab]}</div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 pl-4">
          <div className="p-4 border rounded">
            <h3 className="text-lg font-bold mb-2">Chat with an expert Online Now</h3>
            <p className="text-gray-600 mb-2">
              A Technician Will Answer Your Questions in Minutes. Chat Now.
            </p>
            <img
              src="https://via.placeholder.com/50"
              alt="Support Agent"
              className="rounded-full mb-2"
            />
            <p className="text-sm text-gray-500">JustAnswer</p>
            <button className="mt-2 bg-blue-500 text-white p-2 rounded flex items-center justify-between w-full">
              Open <span>▶</span>
            </button>
          </div>
          <div className="mt-4 text-right">
            <a href="#" className="text-blue-500">
              Tell us what you think
            </a>
            <span className="ml-2 text-gray-500">mi_123456 (0) 🗨️</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;