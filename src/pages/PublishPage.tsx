import { PublishForm } from '../components/PublishForm';

export function PublishPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto space-y-1.5">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
          Publier sur Musica
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Partagez vos chansons et vos albums gratuitement, sans limite ni abonnement.
        </p>
      </div>

      <PublishForm />
    </div>
  );
}
