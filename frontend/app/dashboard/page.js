"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { act, useEffect, useState } from "react";
import { ClipboardCopyIcon, ClipboardCheckIcon } from "@heroicons/react/solid";
import axios from "axios";

export default function DashboardPage(props) {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("http://localhost:5000/check-session", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        setUsername(data.username);
      } catch (error) {
        console.error("Session check failed:", error);
      }
    }

    async function getBalance() {
      try {
        const res = await fetch("http://localhost:5000/balance", {
          credentials: "include",
        });

        const data = await res.json();
        setBalance(parseFloat(data.balance));

        setWalletAddress(data.public_key);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    }

    async function getTransactionData() {}

    checkSession();
    getBalance();
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (currency) {
      convert_currency(currency);
    }
  }, [activeTab, currency]);

  const convert_currency = async (currency) => {
    try {
      // axios .get()''https://
      console.log(process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY);

      try {
        const response = await axios.get("https://api.frankfurter.app/latest", {
          params: {
            amount: amount,
            from: currency,
            to: "USD",
          },
        });

        const result = response.data.rates["USD"];

        if (activeTab === "deposit") {
          setExchangeRate(result / amount);
        } else if (activeTab === "withdraw") {
          setExchangeRate(amount / result);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }

      // console.error("Failed to fetch exchange rate:", error);
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
    }
  };

  const handleCurrencyWithdraw = async (currency) => {
    try {
      const response = await axios.get("https://api.frankfurter.app/latest", {
        params: {
          amount: amount,
          from: "USD",
          to: currency,
        },
      });
      const result = response.data.rates[currency];
      setWithdrawalAmount(result / amount);
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "deposit") {
      handleDeposit();
    } else if (activeTab === "withdraw") {
      handleWithdraw();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`http://localhost:5000/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: parseFloat(exchangeRate * amount),
          currency,
          phone_number: mobileNumber,
        }),
      });

      if (response.ok) {
        // Refresh balance after successful transaction
        await fetchTransactions(); //Karim added test transaction history
        const balanceRes = await fetch("http://localhost:5000/balance", {
          credentials: "include",
        });
        const balanceData = await balanceRes.json();
        setBalance(parseFloat(balanceData.balance));
        setAmount("");
        setCurrency("");
        setMobileNumber("");
      } else {
        console.error(`${activeTab} failed:`, await response.text());
      }
    } catch (error) {
      console.error(`${activeTab} error:`, error);
    } finally {
      setLoading(false);
      setMessage(`Deposit of ${amount} ${currency} successful!`);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage("");
    try {
      console.log("Withdrawal amount:", amount);
      const response = await fetch(`http://localhost:5000/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          phone_number: mobileNumber,
        }),
      });

      if (response.ok) {
        // Refresh balance after successful transaction
        await fetchTransactions(); //Karim added testing transaction history
        const balanceRes = await fetch("http://localhost:5000/balance", {
          credentials: "include",
        });
        const balanceData = await balanceRes.json();
        setBalance(parseFloat(balanceData.balance));
        setAmount("");
        setCurrency("");
        setMobileNumber("");
      } else {
        console.error(`${activeTab} failed:`, await response.text());
      }
    } catch (error) {
      console.error(`${activeTab} error:`, error);
    } finally {
      setLoading(false);
      setMessage(`Withdraw of ${amount} USDC successful!`);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:5000/transactions", {
        credentials: "include",
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-400">
            SafeStash Dashboard
          </div>
          <Button
            variant="outline"
            className="border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-gray-800"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16 space-y-12">
        <section>
          {username === "" ? (
            <p>Loading...</p>
          ) : (
            <h2 className="text-3xl font-bold mb-6">Hello {username},</h2>
          )}
          <h2 className="text-3xl font-bold mb-6">Account Overview</h2>
          <Card className="bg-gray-800 border border-emerald-400">
            <CardContent className="flex justify-between p-6">
              <div>
                <h3 className="text-emerald-400 text-lg font-semibold">
                  Balance
                </h3>
                {balance ? (
                  <>
                    <p className="text-4xl font-bold text-white">
                      {(balance.toFixed(2) - 10000).toFixed(2)} USDC
                    </p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-white">
                    Loading Balance...
                  </p>
                )}
                <p className="text-gray-400 mt-2">Updated just now</p>
                <div className="flex items-center">
                  <p className="text-emerald-400 mt-2">
                    Wallet Address:{" "}
                    <span className="text-gray-200 text-sm">
                      {walletAddress}{" "}
                    </span>
                  </p>
                  <span>
                    {/* <ClipboardCopyIcon
                      className="h-7 w-7 text-grey-200 dark:text-grey-200 cursor-pointer ml-2 mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        setMessage("Copied to clipboard");
                      }}
                    /> */}
                  </span>
                </div>
                {/* <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline"
                >
                  View on Chain
                </a> */}
              </div>
              <div>
                <Wallet className="h-12 w-12 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>
          <Card className="bg-gray-700 border border-emerald-400">
            <CardHeader>
              <div className="flex space-x-4 border-b border-gray-600">
                <button
                  className={`px-4 py-2 font-semibold ${
                    activeTab === "deposit"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-400"
                  }`}
                  onClick={() => {
                    setActiveTab("deposit");
                  }}
                >
                  Deposit
                </button>
                <button
                  className={`px-4 py-2 font-semibold ${
                    activeTab === "withdraw"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-400"
                  }`}
                  onClick={() => {
                    setActiveTab("withdraw");
                  }}
                >
                  Withdraw
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 p-2 border border-gray-600 rounded">
                  <span className="text-emerald-400">
                    {activeTab === "deposit" ? (
                      <ArrowUpCircle />
                    ) : (
                      <ArrowDownCircle />
                    )}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={
                      activeTab === "deposit"
                        ? "Enter amount in local currency to deposit"
                        : "Enter amount in USDC to withdraw"
                    }
                    className="flex-1 bg-transparent focus:outline-none text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <>
                  <div className="flex items-center space-x-2 p-2 border border-gray-600 rounded">
                    <span className="text-emerald-400">Currency</span>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => {
                        setCurrency(e.target.value);
                        convert_currency(e.target.value);
                      }}
                      placeholder="Enter currency"
                      className="flex-1 bg-transparent focus:outline-none text-white"
                    />
                  </div>
                  {exchangeRate &&
                    (activeTab === "deposit" ? (
                      <div className="text-gray-400 mt-2">
                        <p>
                          Exchange Rate: 1 {currency} = {exchangeRate} USD
                        </p>
                        <p>Amount in USD: {amount * exchangeRate}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 mt-2">
                        <p>
                          Exchange Rate: 1 USD = {exchangeRate} {currency}
                        </p>
                        <p>
                          Amount in {currency}: {amount * exchangeRate}
                        </p>
                      </div>
                    ))}
                  <div className="flex items-center space-x-2 p-2 border border-gray-600 rounded">
                    <span className="text-emerald-400">Mobile Number</span>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter mobile number"
                      className="flex-1 bg-transparent focus:outline-none text-white"
                    />
                  </div>
                </>
                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleSubmit}
                >
                  {loading
                    ? "Processing..."
                    : activeTab === "deposit"
                    ? "Deposit Funds"
                    : "Withdraw Funds"}
                </Button>
              </form>
              {loading && (
                <div className="flex justify-center items-center mt-4">
                  <svg
                    className="animate-spin h-5 w-5 text-emerald-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
              {message && (
                <div className="text-emerald-400 mt-4 text-center">
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Transaction History</h2>
          <Card className="bg-gray-700 border border-emerald-400">
            <CardContent>
              <table className="w-full text-left text-gray-200">
                <thead>
                  <tr>
                    <th className="py-3">Date</th>
                    <th className="py-3">Description</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                {/* <tbody className="text-gray-400">
                  <tr>
                    <td className="py-2">2024-10-25</td>
                    <td>Conversion to USDC</td>
                    <td>$500.00</td>
                    <td className="text-emerald-400">Completed</td>
                  </tr>
                  <tr>
                    <td className="py-2">2024-10-20</td>
                    <td>Withdrawal to Bank</td>
                    <td>$300.00</td>
                    <td className="text-emerald-400">Completed</td>
                  </tr>
                  <tr>
                    <td className="py-2">2024-10-15</td>
                    <td>Account Deposit</td>
                    <td>$1000.00</td>
                    <td className="text-emerald-400">Completed</td>
                  </tr>
                </tbody> */}

                <tbody className="text-gray-400">
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="py-2">{transaction.date}</td>
                      <td>{transaction.description}</td>
                      <td>{parseFloat(transaction.amount).toFixed(2)} USDC</td>
                      <td className="text-emerald-400">{transaction.status}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-gray-900 py-8 text-center text-gray-400">
        © 2024 SafeStash. Empowering financial stability in developing nations.
      </footer>
    </div>
  );
}
