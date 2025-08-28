import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function NavBar({ onLogout }) {
  const user = useSelector((s) => s.user);
  const settings = useSelector((s) => s.settings);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600" />
          <Link to="/" className="font-semibold tracking-tight text-gray-900">
            Plataforma
          </Link>
        </div>

        {user ? (
          <nav className="hidden md:flex items-center gap-4 ml-6 text-sm">
            {/* Materiais */}
            {user.role === "solicitante" && (
              <>
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Configurações
                </Link>
                {settings?.sector && settings?.nameOrStore && (
                  <>
                    <Link
                      to="/materiais/novo"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Novo Pedido
                    </Link>
                    <Link
                      to="/materiais/meus"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Meus Pedidos
                    </Link>
                  </>
                )}
              </>
            )}
            {user.role === "responsavel" && (
              <Link
                to="/materiais/lista"
                className="text-gray-700 hover:text-gray-900"
              >
                Lista de Pedidos
              </Link>
            )}

            {/* TI */}
            {user.role === "solicitante_ti" && (
              <>
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Configurações
                </Link>
                {settings?.sector && settings?.nameOrStore && (
                  <>
                    <Link
                      to="/ti/novo"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Chamado de TI
                    </Link>
                    <Link
                      to="/ti/meus"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Meus Chamados
                    </Link>
                  </>
                )}
              </>
            )}
            {user.role === "responsavel_ti" && (
              <Link
                to="/ti/lista"
                className="text-gray-700 hover:text-gray-900"
              >
                Lista de Chamados
              </Link>
            )}
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {!user ? (
            <Link
              to="/login"
              className="px-3 py-2 rounded-xl text-sm bg-gray-900 text-white hover:opacity-90"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl text-sm bg-gray-900 text-white hover:opacity-90"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
