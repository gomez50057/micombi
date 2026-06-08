"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import Button from "../../ui/Button/Button";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/rutas", label: "Rutas" },
  { href: "/contribuye", label: "Contribuye" },
  { href: "/tutoriales", label: "Tutoriales" },
  { href: "/trazar-ruta", label: "Trazar ruta" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const isOffline = useOfflineStatus();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isGoingDown = currentScrollY > lastScrollY.current + 8;
      const isGoingUp = currentScrollY < lastScrollY.current - 8;

      if (isGoingDown && currentScrollY > 120 && !isOpen) {
        setIsHidden(true);
      }

      if (isGoingUp || currentScrollY < 40) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  return (
    <header className={`${styles.header} ${isHidden ? styles.hidden : ""}`}>
      {isOffline ? (
        <div className={styles.offline}>
          Estas sin conexion. Puedes seguir viendo rutas guardadas.
        </div>
      ) : null}
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">
          <Image
            alt="Mi Combi"
            className={styles.logo}
            height={228}
            priority
            src="/img/logo.png"
            width={768}
          />
        </Link>
        <button
          aria-expanded={isOpen}
          aria-label="Abrir menu"
          className={styles.menuButton}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`${styles.links} ${isOpen ? styles.open : ""}`}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Button href="/contribuye" variant="secondary">
            Aportar ruta
          </Button>
        </div>
      </nav>
    </header>
  );
}
