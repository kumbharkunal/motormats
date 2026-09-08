'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftOpen,
  ReceiptText,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore, type ReactNode } from 'react';

import { BRAND, INK } from './admin-tokens';
import { AdminWordmark } from './admin-wordmark';

const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 76;
const STORAGE_KEY = 'motormats:admin:sidebar-collapsed';

/**
 * Both headers are this exact height and carry their own bottom border, so the
 * two rules meet as one unbroken line across the sidebar and the content area.
 * A MUI `Toolbar` cannot be used here — its responsive `minHeight` overrides an
 * explicit one and the borders drift apart.
 */
const HEADER_HEIGHT = 72;

/** The icon column width, shared by the nav rows and the account row below them. */
const ICON_SLOT = 38;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Rendered in red — a destructive or session-ending action. */
  danger?: boolean;
};

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    section: 'Commerce',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/orders', label: 'Orders', icon: ReceiptText },
    ],
  },
  {
    section: 'People',
    items: [{ href: '/admin/users', label: 'Users', icon: Users }],
  },
];

// `exact` matters on "/": a prefix match would mark it active on every route.
const FOOTER_NAV: NavItem[] = [
  { href: '/', label: 'View storefront', icon: Store, exact: true },
  { href: '/sign-out', label: 'Sign out', icon: LogOut, exact: true, danger: true },
];

/**
 * The collapsed flag lives in `localStorage`, which is an external store rather
 * than React state — reading it through `useSyncExternalStore` keeps the server
 * render honest (always expanded) and picks up the real value on hydration,
 * with cross-tab sync falling out of the `storage` event for free.
 */
const listeners = new Set<() => void>();

function subscribeToSidebarPref(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readSidebarPref(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // A browser with site data blocked still gets a working sidebar.
    return false;
  }
}

function writeSidebarPref(next: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  } catch {
    // Preference is a nicety; never let it break navigation.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Admin chrome.
 *
 * The drawer is permanent from `md` up and a temporary overlay below, so the
 * panel is genuinely usable on a phone rather than a desktop layout squeezed
 * onto a small screen. On desktop it collapses to an icon rail; the choice is
 * remembered per browser because it is a workspace preference, not app state.
 */
export function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const collapsed = useSyncExternalStore(
    subscribeToSidebarPref,
    readSidebarPref,
    // The server has no preference to read, so it renders the expanded sidebar.
    () => false,
  );

  function toggleCollapsed() {
    writeSidebarPref(!collapsed);
  }

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const activeLabel =
    NAV.flatMap((group) => group.items).find((item) => isActive(item))?.label ?? 'Admin';

  /** `rail` is the desktop icon-only mode; the mobile drawer is always full width. */
  function navigation(rail: boolean) {
    const itemButton = (item: NavItem, onNavigate: () => void) => {
      const Icon = item.icon;
      const active = isActive(item);

      const button = (
        <ListItemButton
          component={Link}
          href={item.href}
          selected={active}
          onClick={onNavigate}
          sx={{
            borderRadius: 2.5,
            mb: 0.5,
            minHeight: 44,
            position: 'relative',
            justifyContent: rail ? 'center' : 'flex-start',
            px: rail ? 0 : 1.5,
            // `primary.main` (#E10600) rather than the lighter `primary.light`: at
            // 14px this is body copy, and on a light ground the brand red is the
            // shade that clears WCAG AA — the inverse of the storefront's rule.
            color: item.danger ? 'primary.main' : active ? 'text.primary' : 'text.secondary',
            '&:hover': {
              color: item.danger ? 'primary.dark' : 'text.primary',
              ...(item.danger ? { backgroundColor: BRAND.wash } : undefined),
            },
            // The rail marks the active route when the label is not there to.
            '&::before': active
              ? {
                  content: '""',
                  position: 'absolute',
                  left: rail ? 6 : 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  borderRadius: 999,
                  backgroundColor: 'primary.main',
                }
              : undefined,
          }}
        >
          <ListItemIcon
            sx={{ minWidth: rail ? 0 : ICON_SLOT, color: 'inherit', justifyContent: 'center' }}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
          </ListItemIcon>
          {rail ? null : (
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: { fontSize: 14, fontWeight: active || item.danger ? 600 : 500 },
                },
              }}
            />
          )}
        </ListItemButton>
      );

      return rail ? (
        <Tooltip key={item.href} title={item.label} placement="right">
          <Box>{button}</Box>
        </Tooltip>
      ) : (
        <Box key={item.href}>{button}</Box>
      );
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            height: HEADER_HEIGHT,
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: rail ? 0 : 2,
            gap: 1,
            justifyContent: rail ? 'center' : 'space-between',
          }}
        >
          {rail ? (
            <Link href="/admin" aria-label="Motormats admin">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: BRAND.wash,
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                M
              </Box>
            </Link>
          ) : (
            <Link href="/admin" aria-label="Motormats admin" style={{ display: 'flex' }}>
              <AdminWordmark size="sm" />
            </Link>
          )}

          {rail ? null : (
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '0.1em',
                fontSize: 10,
                border: '1px solid',
                borderColor: BRAND.washBorder,
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
              }}
            >
              ADMIN
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: rail ? 1 : 1.5, py: 1.5 }}>
          {NAV.map((group) => (
            <Box key={group.section} sx={{ mb: 1.5 }}>
              {rail ? null : (
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: INK.muted,
                    fontSize: 10,
                    px: 1.5,
                    mb: 0.5,
                  }}
                >
                  {group.section}
                </Typography>
              )}
              <List disablePadding>
                {group.items.map((item) => itemButton(item, () => setMobileOpen(false)))}
              </List>
            </Box>
          ))}
        </Box>

        <Divider />

        <Box sx={{ px: rail ? 1 : 1.5, py: 1.5 }}>
          <List disablePadding>
            {FOOTER_NAV.map((item) => itemButton(item, () => setMobileOpen(false)))}
          </List>

          {/* Same icon slot and padding as a nav row, so the avatar and the
              identity text sit on the nav's two vertical rules. */}
          <Tooltip title={rail ? `${email} · Administrator` : ''} placement="right">
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                minHeight: 44,
                px: rail ? 0 : 1.5,
                justifyContent: rail ? 'center' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  width: rail ? 'auto' : ICON_SLOT,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    bgcolor: BRAND.wash,
                    color: 'primary.main',
                  }}
                >
                  <ShieldCheck size={16} strokeWidth={2} aria-hidden />
                </Avatar>
              </Box>

              {rail ? null : (
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }} noWrap>
                    {email}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', lineHeight: 1.35 }}
                  >
                    Administrator
                  </Typography>
                </Box>
              )}
            </Box>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  const railWidth = collapsed ? RAIL_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', bgcolor: 'background.default' }}>
      <Box
        component="nav"
        sx={{
          width: { md: railWidth },
          flexShrink: { md: 0 },
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {navigation(false)}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: railWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        >
          {navigation(collapsed)}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            height: HEADER_HEIGHT,
            flexShrink: 0,
            px: { xs: 2, md: 3 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            // Opaque rather than translucent-and-blurred: on a light ground a
            // see-through header reads as a smear over the scrolling content, and
            // dropping the blur removes a per-frame re-sample.
            bgcolor: 'background.paper',
          }}
        >
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </IconButton>

          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="bottom">
            <IconButton
              onClick={toggleCollapsed}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={collapsed}
            >
              {collapsed ? <PanelLeftOpen size={19} /> : <ChevronLeft size={20} />}
            </IconButton>
          </Tooltip>

          <Typography sx={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            {activeLabel}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
