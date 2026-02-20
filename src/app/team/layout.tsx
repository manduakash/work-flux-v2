import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">

            {/* The Sidebar Component */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 pl-64 transition-all duration-300">
                <div className="min-h-screen p-8">
                    {children}
                </div>
            </main>

        </div>
    );
}