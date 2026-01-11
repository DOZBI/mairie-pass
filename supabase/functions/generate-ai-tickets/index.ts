import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock football data for sandbox mode
const MOCK_MATCHES = [
  { team_a: "AS Monaco", team_b: "Paris FC", odds_a: 1.8, odds_draw: 3.2, odds_b: 2.5, league: "Ligue 1" },
  { team_a: "Diables Noirs", team_b: "AC Léopards", odds_a: 2.1, odds_draw: 3.0, odds_b: 2.2, league: "Congo Premier League" },
  { team_a: "Étoile du Congo", team_b: "AS Otohô", odds_a: 1.9, odds_draw: 3.3, odds_b: 2.4, league: "Congo Premier League" },
  { team_a: "V. Club", team_b: "TP Mazembe", odds_a: 2.3, odds_draw: 3.1, odds_b: 1.7, league: "DRC Ligue" },
  { team_a: "Real Madrid", team_b: "Barcelona", odds_a: 2.0, odds_draw: 3.4, odds_b: 2.0, league: "La Liga" },
  { team_a: "Manchester City", team_b: "Liverpool", odds_a: 1.9, odds_draw: 3.5, odds_b: 2.1, league: "Premier League" },
  { team_a: "Bayern Munich", team_b: "Borussia Dortmund", odds_a: 1.6, odds_draw: 3.8, odds_b: 2.8, league: "Bundesliga" },
  { team_a: "Juventus", team_b: "AC Milan", odds_a: 2.2, odds_draw: 3.2, odds_b: 2.0, league: "Serie A" },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action } = await req.json();

    if (action === 'generate') {
      // Generate AI tickets using Lovable AI
      const prompt = `Tu es un expert en paris sportifs football. Génère 3 propositions de tickets de paris pour aujourd'hui.

Pour chaque ticket, fournis:
1. Un nom accrocheur
2. Une description courte
3. 1 à 3 pronostics (matchs avec prédiction)
4. La cote totale estimée
5. Le multiplicateur de gain

Utilise ces matchs disponibles:
${MOCK_MATCHES.map(m => `- ${m.team_a} vs ${m.team_b} (${m.league}) - Cotes: 1=${m.odds_a}, X=${m.odds_draw}, 2=${m.odds_b}`).join('\n')}

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{
  "tickets": [
    {
      "name": "Nom du ticket",
      "description": "Description courte",
      "predictions": [
        {
          "match_name": "Équipe A vs Équipe B",
          "team_a": "Équipe A",
          "team_b": "Équipe B",
          "prediction": "1" ou "X" ou "2",
          "prediction_label": "Victoire Équipe A" ou "Match Nul" ou "Victoire Équipe B",
          "odds": 1.8
        }
      ],
      "is_combo": true/false,
      "total_odds": 2.5,
      "win_multiplier": 2.5
    }
  ]
}`;

      let aiTickets;

      if (lovableApiKey) {
        // Use Lovable AI Gateway
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'Tu es un assistant expert en paris sportifs. Réponds toujours en JSON valide.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('AI Gateway error:', errorText);
          throw new Error('Erreur API IA');
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiTickets = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Format de réponse IA invalide');
        }
      } else {
        // Fallback: generate mock tickets
        aiTickets = {
          tickets: [
            {
              name: "🔥 Super Combo Africain",
              description: "Les meilleures équipes du Congo !",
              predictions: [
                { match_name: "Diables Noirs vs AC Léopards", team_a: "Diables Noirs", team_b: "AC Léopards", prediction: "1", prediction_label: "Victoire Diables Noirs", odds: 2.1 },
                { match_name: "Étoile du Congo vs AS Otohô", team_a: "Étoile du Congo", team_b: "AS Otohô", prediction: "1", prediction_label: "Victoire Étoile du Congo", odds: 1.9 }
              ],
              is_combo: true,
              total_odds: 3.99,
              win_multiplier: 3.99
            },
            {
              name: "⚽ Classique Européen",
              description: "Les grands derbys européens",
              predictions: [
                { match_name: "Real Madrid vs Barcelona", team_a: "Real Madrid", team_b: "Barcelona", prediction: "X", prediction_label: "Match Nul", odds: 3.4 }
              ],
              is_combo: false,
              total_odds: 3.4,
              win_multiplier: 3.4
            },
            {
              name: "💰 Valeur Sûre",
              description: "Pronostic à forte probabilité",
              predictions: [
                { match_name: "Bayern Munich vs Borussia Dortmund", team_a: "Bayern Munich", team_b: "Borussia Dortmund", prediction: "1", prediction_label: "Victoire Bayern", odds: 1.6 }
              ],
              is_combo: false,
              total_odds: 1.6,
              win_multiplier: 1.6
            }
          ]
        };
      }

      // Save tickets to database
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const insertedTickets = [];
      for (const ticket of aiTickets.tickets) {
        const { data, error } = await supabase
          .from('ai_football_tickets')
          .insert({
            ticket_name: ticket.name,
            ticket_description: ticket.description,
            predictions: ticket.predictions,
            is_combo: ticket.is_combo,
            total_odds: ticket.total_odds,
            estimated_win_multiplier: ticket.win_multiplier,
            base_stake: 100,
            status: 'active',
            result: 'pending',
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
        } else {
          insertedTickets.push(data);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${insertedTickets.length} tickets IA générés`,
          tickets: insertedTickets 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      // Get active AI tickets with stats
      const { data: tickets, error } = await supabase
        .from('ai_football_tickets')
        .select('*')
        .in('status', ['proposed', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get play counts for each ticket
      const ticketsWithStats = await Promise.all(
        (tickets || []).map(async (ticket) => {
          const { count } = await supabase
            .from('ai_ticket_plays')
            .select('*', { count: 'exact', head: true })
            .eq('ai_ticket_id', ticket.id);

          const { count: identicalCount } = await supabase
            .from('ai_ticket_plays')
            .select('*', { count: 'exact', head: true })
            .eq('ai_ticket_id', ticket.id)
            .eq('is_identical_to_proposal', true);

          const totalCount = count || 0;
          const identicalTotal = identicalCount || 0;

          return {
            ...ticket,
            total_players: totalCount,
            identical_players: identicalTotal,
            identical_percentage: totalCount > 0 ? Math.round((identicalTotal / totalCount) * 100) : 0
          };
        })
      );

      return new Response(
        JSON.stringify({ success: true, tickets: ticketsWithStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
