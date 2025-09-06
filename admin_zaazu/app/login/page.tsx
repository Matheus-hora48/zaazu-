"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAdminLogging } from "@/lib/use-admin-logging";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { logLogin, logError } = useAdminLogging();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);

      // Log da ação de login bem-sucedido
      await logLogin({
        userAgent: navigator.userAgent,
        ip: "admin-panel",
      });

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);

      // Log da tentativa de login falhou
      await logError(
        "login",
        `Tentativa de login falhou para: ${email}`,
        error,
        {
          email: email,
          userAgent: navigator.userAgent,
        }
      );

      setError("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-20 blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-15 blur-lg animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-10 blur-lg animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-sm animate-fadeInUp">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-18 h-18 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-purple-500/25 animate-float animate-glow">
            <Sparkles className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-2 animate-gradient">
            Zaazu
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <p className="text-gray-500 text-sm font-medium">Admin</p>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500 hover:bg-white/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50/90 border border-red-100 rounded-2xl p-4 flex items-center space-x-3 animate-fadeInUp">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-600 font-medium">
                  {error}
                </span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 block"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl border-gray-200/60 bg-white/60 backdrop-blur-sm focus:border-purple-400 focus:ring-purple-200/50 text-gray-900 placeholder:text-gray-400 font-medium form-input hover:bg-white/80"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 block"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-gray-200/60 bg-white/60 backdrop-blur-sm focus:border-purple-400 focus:ring-purple-200/50 text-gray-900 placeholder:text-gray-400 font-medium pr-14 form-input hover:bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100/50 hover:scale-110"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Entrar</span>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Acesso restrito para administradores
            </p>
          </div>
        </div>

        {/* Demo Credentials - More elegant */}
        <div className="mt-6 p-5 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/40">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">Demonstração</p>
            <div className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full animate-pulse">
              Demo
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <span className="font-medium">Email:</span>
              <code className="bg-gray-100/80 px-2 py-1 rounded text-xs hover:bg-gray-200/80 transition-colors cursor-pointer">
                admin@zaazu.com
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Senha:</span>
              <code className="bg-gray-100/80 px-2 py-1 rounded text-xs hover:bg-gray-200/80 transition-colors cursor-pointer">
                admin123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
