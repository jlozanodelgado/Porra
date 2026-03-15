export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string
                    nickname: string | null
                    phone: string | null
                    is_paid: boolean
                    is_admin: boolean
                    total_points: number
                    created_at: string
                }
                Insert: {
                    id: string
                    display_name: string
                    nickname?: string | null
                    phone?: string | null
                    is_paid?: boolean
                    is_admin?: boolean
                    total_points?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string
                    nickname?: string | null
                    phone?: string | null
                    is_paid?: boolean
                    is_admin?: boolean
                    total_points?: number
                    created_at?: string
                }
                Relationships: []
            }
            teams: {
                Row: {
                    id: number
                    name: string
                    flag_url: string | null
                    group_name: string | null
                }
                Insert: {
                    id?: number
                    name: string
                    flag_url?: string | null
                    group_name?: string | null
                }
                Update: {
                    id?: number
                    name?: string
                    flag_url?: string | null
                    group_name?: string | null
                }
                Relationships: []
            }
            matches: {
                Row: {
                    id: number
                    home_team_id: number | null
                    away_team_id: number | null
                    kickoff_time: string
                    home_goals_real: number | null
                    away_goals_real: number | null
                    is_playoff: boolean
                    status: string
                }
                Insert: {
                    id?: number
                    home_team_id?: number | null
                    away_team_id?: number | null
                    kickoff_time: string
                    home_goals_real?: number | null
                    away_goals_real?: number | null
                    is_playoff?: boolean
                    status?: string
                }
                Update: {
                    id?: number
                    home_team_id?: number | null
                    away_team_id?: number | null
                    kickoff_time?: string
                    home_goals_real?: number | null
                    away_goals_real?: number | null
                    is_playoff?: boolean
                    status?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "matches_home_team_id_fkey"
                        columns: ["home_team_id"]
                        isOneToOne: false
                        referencedRelation: "teams"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "matches_away_team_id_fkey"
                        columns: ["away_team_id"]
                        isOneToOne: false
                        referencedRelation: "teams"
                        referencedColumns: ["id"]
                    }
                ]
            }
            predictions: {
                Row: {
                    id: number
                    user_id: string
                    match_id: number
                    home_goals_pred: number
                    away_goals_pred: number
                    points_earned: number
                    updated_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    match_id: number
                    home_goals_pred: number
                    away_goals_pred: number
                    points_earned?: number
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    match_id?: number
                    home_goals_pred?: number
                    away_goals_pred?: number
                    points_earned?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "predictions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "predictions_match_id_fkey"
                        columns: ["match_id"]
                        isOneToOne: false
                        referencedRelation: "matches"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_email_by_nickname: {
                Args: {
                    p_nickname: string
                }
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
