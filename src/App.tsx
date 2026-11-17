import { AnimatePresence, motion } from 'motion/react';
import { AlbumDetailModal } from './components/AlbumDetailModal';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { LyricsModal } from './components/LyricsModal';
import { Navbar } from './components/Navbar';
import { Player } from './components/Player';
import { AudioProvider } from './contexts/AudioContext';
import { MusicProvider, useMusic } from './contexts/MusicContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DiscoverPage } from './pages/DiscoverPage';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublishPage } from './pages/PublishPage';

function MusicaShell() {
  const { activeTab, toastMessage } = useMusic();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'discover':
        return <DiscoverPage />;
      case 'publish':
        return <PublishPage />;
      case 'library':
        return <LibraryPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-36 md:pb-28 max-w-screen-2xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Lecteur audio permanent */}
      <Player />

      {/* Modales */}
      <AuthModal />
      <LyricsModal />
      <AlbumDetailModal />

      {/* Notification discrète */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-32 md:bottom-24 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold shadow-xl border border-zinc-800 dark:border-zinc-200"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <AudioProvider>
          <MusicaShell />
        </AudioProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}
