/**
 * Hand-authored to match supabase/migrations. After linking a real project you
 * can regenerate this with:
 *   supabase gen types typescript --linked > src/types/database.ts
 */
export type DraftTypeEnum = "GOAT_XI" | "ALL_TIME_XI" | "UNDERRATED_XI";
export type DraftStatusEnum = "LOBBY" | "IN_PROGRESS" | "COMPLETED";
export type PlayerRoleEnum = "GK" | "DEF" | "MID" | "FWD";
export type VerdictModeEnum = "ANALYST" | "COMMENTATOR" | "HISTORIAN" | "TRASH_TALK";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      players: {
        Row: { id: string; name: string; role: PlayerRoleEnum; rating: number; metadata: Json };
        Insert: { id?: string; name: string; role: PlayerRoleEnum; rating: number; metadata?: Json };
        Update: { id?: string; name?: string; role?: PlayerRoleEnum; rating?: number; metadata?: Json };
        Relationships: [];
      };
      draft_rooms: {
        Row: {
          id: string;
          name: string;
          draft_type: DraftTypeEnum;
          status: DraftStatusEnum;
          roster_size: number;
          join_code: string;
          created_by: string;
          created_at: string;
          started_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          draft_type: DraftTypeEnum;
          status?: DraftStatusEnum;
          roster_size?: number;
          join_code: string;
          created_by: string;
          created_at?: string;
          started_at?: string | null;
        };
        Update: {
          name?: string;
          draft_type?: DraftTypeEnum;
          status?: DraftStatusEnum;
          roster_size?: number;
          join_code?: string;
          started_at?: string | null;
        };
        Relationships: [];
      };
      draft_participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          display_name: string;
          draft_position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          display_name: string;
          draft_position: number;
          created_at?: string;
        };
        Update: { display_name?: string; draft_position?: number };
        Relationships: [];
      };
      draft_picks: {
        Row: {
          id: string;
          room_id: string;
          round: number;
          pick_number: number;
          participant_id: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round: number;
          pick_number: number;
          participant_id: string;
          player_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      draft_analyses: {
        Row: {
          id: string;
          room_id: string;
          mode: VerdictModeEnum;
          model: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          mode: VerdictModeEnum;
          model: string;
          result: Json;
          created_at?: string;
        };
        Update: { result?: Json; model?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      make_pick: {
        Args: { p_room_id: string; p_player_id: string };
        Returns: Database["public"]["Tables"]["draft_picks"]["Row"];
      };
      auto_pick: {
        Args: { p_room_id: string };
        Returns: Database["public"]["Tables"]["draft_picks"]["Row"];
      };
      start_draft: {
        Args: { p_room_id: string };
        Returns: undefined;
      };
      leave_room: {
        Args: { p_room_id: string };
        Returns: undefined;
      };
      get_public_verdict: {
        Args: { p_room_id: string };
        Returns: Json;
      };
    };
    Enums: {
      draft_type: DraftTypeEnum;
      draft_status: DraftStatusEnum;
      player_role: PlayerRoleEnum;
      verdict_mode: VerdictModeEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}
