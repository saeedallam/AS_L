import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  return children;
}
