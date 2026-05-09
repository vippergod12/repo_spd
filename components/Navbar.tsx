'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Category } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { username, logout } = useAuth();
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.dropdown')) setDropdownOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [dropdownOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function isDesktopViewport() {
    return window.matchMedia?.('(min-width: 769px)').matches;
  }

  function handleDropdownEnter() {
    if (!isDesktopViewport()) return;
    clearCloseTimer();
    setDropdownOpen(true);
  }

  function handleDropdownLeave() {
    if (!isDesktopViewport()) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
      closeTimerRef.current = null;
    }, 300);
  }

  function closeMobile() {
    setOpen(false);
    setDropdownOpen(false);
    clearCloseTimer();
  }

  const isHomeActive = pathname === '/';
  const isShopActive = pathname === '/cua-hang';
  const isWarrantyActive = pathname === '/bao-hanh';
  const isAboutActive = pathname === '/gioi-thieu';
  const isConsultActive = pathname === '/tu-van';
  const isAdminActive = pathname?.startsWith('/admin');

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link
          href="/"
          className="navbar-brand"
          onClick={() => {
            closeMobile();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="brand-mark">R</span>
          <span>R.E.P.O</span>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <Link
            href="/"
            className={isHomeActive ? 'active' : ''}
            onClick={closeMobile}
          >
            Trang chủ
          </Link>
          <Link
            href="/cua-hang"
            className={isShopActive ? 'active' : ''}
            onClick={closeMobile}
          >
            Kho Acc
          </Link>
          <div
            className={`dropdown ${dropdownOpen ? 'open' : ''}`}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              className="dropdown-toggle"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              onClick={(e) => {
                setDropdownOpen((v) => !v);
                e.currentTarget.blur();
              }}
            >
              Phân loại
            </button>
            <div className="dropdown-menu" role="menu">
              {categories.length === 0 && <span className="dropdown-empty">Đang tải danh mục</span>}
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/danh-muc/${c.slug}`}
                  role="menuitem"
                  onClick={closeMobile}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/bao-hanh"
            className={isWarrantyActive ? 'active' : ''}
            onClick={closeMobile}
          >
            Bảo hành
          </Link>
          <Link
            href="/gioi-thieu"
            className={isAboutActive ? 'active' : ''}
            onClick={closeMobile}
          >
            Giới thiệu
          </Link>
          <Link
            href="/tu-van"
            className={`navbar-cta ${isConsultActive ? 'is-active' : ''}`}
            onClick={closeMobile}
          >
            Tìm Acc theo yêu cầu
          </Link>
          {username && (
            <>
              <Link
                href="/admin"
                className={isAdminActive ? 'active' : ''}
                onClick={closeMobile}
              >
                Quản trị
              </Link>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  closeMobile();
                  logout();
                }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className={`navbar-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
