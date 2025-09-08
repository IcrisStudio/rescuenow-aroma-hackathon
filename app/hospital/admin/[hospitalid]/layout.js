"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Utensils, ShoppingBag, FileText, BarChart2, Table, Percent, Users, LogOut } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip";
import Link from "next/link";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarVariants = {
    open: {
      width: 240,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      width: 64,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
    { icon: FileText, label: "Invoice", href: "/admin/invoice" },
    { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
    { icon: Percent, label: "Discounts", href: "/admin/discounts" },
    { icon: Users, label: "Customer", href: "/admin/insights" },
  ];

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-100 text-lg">
        {/* Sidebar */}
        <motion.aside
          initial="closed"
          animate={isSidebarOpen ? "open" : "closed"}
          variants={sidebarVariants}
          className="bg-white shadow-lg border-r border-gray-200 flex flex-col"
        >
          <div className="p-4 flex items-center justify-between">
            <motion.div
              animate={{ opacity: isSidebarOpen ? 1 : 0, x: isSidebarOpen ? 0 : -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              {isSidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-300 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xl">R</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Rescue Now</h2>
                </div>
              )}
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-gray-100 rounded-full"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
          <Separator className=" mt-10" />
          <div className="p-2">
            <motion.div
              animate={{ opacity: isSidebarOpen ? 1 : 0, x: isSidebarOpen ? 0 : -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
              {isSidebarOpen && (
                <div className="text-md">
                  <p className="font-medium text-gray-900">Admin User</p>
                  <p className="text-gray-500 text-sm">admin@icris.com</p>
                </div>
              )}
            </motion.div>
          </div>
          <Separator />
          <nav className="flex-1 p-2 mt-4 space-y-1">
            {navItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-4 p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <item.icon className="w-5 h-5" />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-md font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                {!isSidebarOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
          <Separator />
          <div className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/logout">
                  <motion.div
                    whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium"
                        >
                          Logout
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </TooltipTrigger>
              {!isSidebarOpen && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;