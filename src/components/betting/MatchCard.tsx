import { Match, Odds } from '@/lib/sportmonks-mock';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface MatchCardProps {
  match: Match;
  onSelectOdds: (odds: Odds) => void;
  isSelected: (oddsId: string) => boolean;
}

export function MatchCard({ match, onSelectOdds, isSelected }: MatchCardProps) {
  const isLive = match.state.short_name === 'LIVE' || match.state.short_name === 'HT';
  const mainOdds = match.odds.filter(o => o.market === '1X2');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl overflow-hidden border border-border"
    >
      {/* League header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
        <img 
          src={match.league.logo_path} 
          alt={match.league.name}
          className="w-4 h-4 object-contain"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
        />
        <span className="text-xs text-muted-foreground font-medium">{match.league.name}</span>
        {isLive && (
          <span className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-500">
              {match.state.short_name === 'HT' ? 'MT' : `${match.time.minute}'`}
            </span>
          </span>
        )}
        {!isLive && (
          <span className="ml-auto text-xs text-muted-foreground">
            {format(new Date(match.starting_at), 'HH:mm', { locale: fr })}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          {/* Home team */}
          <div className="flex items-center gap-2 flex-1">
            <img 
              src={match.localTeam.logo_path} 
              alt={match.localTeam.name}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
            <span className="text-sm font-semibold text-foreground truncate">
              {match.localTeam.short_code}
            </span>
          </div>

          {/* Score or time */}
          <div className="flex-shrink-0 mx-3">
            {isLive || match.scores.localteam_score !== null ? (
              <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-lg">
                <span className="text-lg font-bold text-foreground">
                  {match.scores.localteam_score ?? 0}
                </span>
                <span className="text-muted-foreground">-</span>
                <span className="text-lg font-bold text-foreground">
                  {match.scores.visitorteam_score ?? 0}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground font-medium">VS</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-semibold text-foreground truncate">
              {match.visitorTeam.short_code}
            </span>
            <img 
              src={match.visitorTeam.logo_path} 
              alt={match.visitorTeam.name}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          </div>
        </div>

        {/* Odds buttons */}
        <div className="grid grid-cols-3 gap-2">
          {mainOdds.map((odds) => (
            <button
              key={odds.id}
              onClick={() => onSelectOdds(odds)}
              className={`py-2 px-3 rounded-lg text-center transition-all ${
                isSelected(odds.id)
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-card'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <div className="text-xs text-muted-foreground mb-0.5">{odds.label}</div>
              <div className="font-bold text-sm">{odds.value.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
