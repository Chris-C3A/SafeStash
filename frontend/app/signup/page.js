"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/register-user",
        {
          username,
          phonenumber: phoneNumber,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Signup successful:", res.data);
      // Redirect to login page or dashboard
      window.location.href = "/login";
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-700 border border-emerald-400 p-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-emerald-400">
            <UserPlus className="h-6 w-6 text-emerald-400" />
            Sign Up for SafeStash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-white"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Sign Up
            </Button>
          </form>
        </CardContent>
        <div className="mt-6 text-center">
          <p className="text-gray-400">Already have an account?</p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/login")}
            className="mt-2 border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-white"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
