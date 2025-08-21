import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function NavBar({ onLogout }) {
  const user = useSelector((s) => s.user);
  const settings = useSelector((s) => s.settings);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-white">
        <Link to="/" className="font-semibold mr-4">
          Plataforma
        </Link>

        {user ? (
          <>
            {/* Materiais */}
            {user.role === "solicitante" && (
              <>
                <Link to="/settings" className="hover:text-gray-300">
                  Configurações
                </Link>
                {settings?.sector && settings?.nameOrStore && (
                  <>
                    <Link to="/materiais/novo" className="hover:text-gray-300">
                      Novo Pedido
                    </Link>
                    <Link to="/materiais/meus" className="hover:text-gray-300">
                      Meus Pedidos
                    </Link>
                  </>
                )}
              </>
            )}
            {user.role === "responsavel" && (
              <Link to="/materiais/lista" className="hover:text-gray-300">
                Lista de Pedidos
              </Link>
            )}

            {/* TI */}
            {user.role === "solicitante_ti" && (
              <>
                <Link to="/settings" className="hover:text-gray-300">
                  Configurações
                </Link>
                {settings?.sector && settings?.nameOrStore && (
                  <>
                    <Link to="/ti/novo" className="hover:text-gray-300">
                      Chamado de TI
                    </Link>
                    <Link to="/ti/meus" className="hover:text-gray-300">
                      Meus Chamados
                    </Link>
                  </>
                )}
              </>
            )}
            {user.role === "responsavel_ti" && (
              <Link to="/ti/lista" className="hover:text-gray-300">
                Lista de Chamados
              </Link>
            )}

            <button onClick={onLogout} className="ml-auto hover:text-gray-300">
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-gray-300">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
