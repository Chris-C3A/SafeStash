"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpDown,
  DollarSign,
  Lock,
  Smartphone,
  Wallet,
  Globe,
  UserPlus,
  Link,
  BarChart,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-400">SafeStash</div>
          <Button
            variant="outline"
            className="border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-gray-800"
            onClick={() => (window.location.href = "/signup")} // CHANGED: Added onClick handler
          >
            Sign Up
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Stop Inflation.{" "}
            <span className="text-emerald-400">Protect Your Savings.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
            SafeStash helps you shield your money from inflation in developing
            countries by easily converting your local currency to USDC on the
            Stellar network.
          </p>
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Get Started
          </Button>
        </section>

        <section className="my-20">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Why Choose SafeStash?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-gray-700 border-emerald-400 border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  Protect Your Wealth
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-200">
                Shield your savings from local currency devaluation by
                converting to USDC, a stable digital dollar.
              </CardContent>
            </Card>
            <Card className="bg-gray-700 border-emerald-400 border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="h-5 w-5 text-emerald-400" />
                  Easy Web Access
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-200">
                Manage your funds anytime, anywhere with our user-friendly web
                application, accessible from any device with an internet
                connection.
              </CardContent>
            </Card>
            <Card className="bg-gray-700 border-emerald-400 border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ArrowUpDown className="h-5 w-5 text-emerald-400" />
                  Quick Conversions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-200">
                Instantly convert between your local currency and USDC whenever
                you need, maintaining your purchasing power.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="my-20">
          <h2 className="mb-10 text-center text-3xl font-bold">
            How SafeStash Works
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                title: "Sign Up",
                description: "Create your SafeStash account on our website.",
                icon: UserPlus,
              },
              {
                step: 2,
                title: "Connect Bank",
                description: "Link your local bank account securely.",
                icon: Link,
              },
              {
                step: 3,
                title: "Convert to USDC",
                description:
                  "Transform your money into stable digital dollars.",
                icon: DollarSign,
              },
              {
                step: 4,
                title: "Manage Funds",
                description: "Monitor and withdraw funds as needed.",
                icon: BarChart,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white mx-auto">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-20">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "What is USDC?",
                answer:
                  "USDC is a digital dollar (stablecoin) that maintains a steady value of 1 USDC = 1 US Dollar, protecting your money from local currency inflation.",
              },
              {
                question: "How do I access SafeStash?",
                answer:
                  "SafeStash is a web-based application. You can access it from any device with an internet connection by visiting our website and signing up for an account.",
              },
              {
                question: "Is SafeStash safe to use?",
                answer:
                  "Yes, SafeStash uses the secure Stellar blockchain for all transactions, ensuring your funds are protected and every conversion is transparent.",
              },
              {
                question: "Can I withdraw my money back to local currency?",
                answer:
                  "You can convert your USDC back to local currency at any time using our simple in-app process.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-700 p-4 border border-emerald-400"
              >
                <h3 className="mb-2 text-lg font-semibold">{item.question}</h3>
                <p className="text-gray-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-20 text-center">
          <h2 className="mb-6 text-3xl font-bold">
            Ready to Protect Your Financial Future?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
            Join thousands of users in developing countries who have already
            secured their savings with SafeStash.
          </p>
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => (window.location.href = "/signup")} // CHANGED: Added onClick handler
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Sign Up for SafeStash Now
          </Button>
        </section>
      </main>

      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          © 2024 SafeStash. Empowering financial stability in developing
          nations.
        </div>
      </footer>
    </div>
  );
}
