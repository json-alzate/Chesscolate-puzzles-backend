import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetPuzzlesDto {
    @IsString()
    elo: string;


    @IsString()
    @IsIn(["opening", "middlegame", "endgame", "rookEndgame", "bishopEndgame", "pawnEndgame", "knightEndgame", "queenEndgame", "queenRookEndgame", "advancedPawn", "attackingF2F7", "capturingDefender", "discoveredAttack", "doubleCheck", "exposedKing", "fork", "hangingPiece", "kingsideAttack", "pin", "queensideAttack", "sacrifice", "skewer", "trappedPiece", "attraction", "clearance", "defensiveMove", "deflection", "interference", "intermezzo", "quietMove", "xRayAttack", "zugzwang", "mate", "mateIn1", "mateIn2", "mateIn3", "mateIn4", "mateIn5", "anastasiaMate", "arabianMate", "backRankMate", "bodenMate", "doubleBishopMate", "dovetailMate", "hookMate", "smotheredMate", "equality", "advantage", "crushing", "mate", "oneMove", "short", "long", "veryLong"])
    @IsOptional()
    theme?: string;

    @IsString()
    @IsIn(["Sicilian_Defense", "French_Defense", "Queens_Pawn_Game", "Italian_Game", "Caro-Kann_Defense", "Scandinavian_Defense", "Queens_Gambit_Declined", "English_Opening", "Ruy_Lopez", "Indian_Defense", "Scotch_Game", "Russian_Game", "Philidor_Defense", "Modern_Defense", "Four_Knights_Game", "Kings_Gambit_Accepted", "Zukertort_Opening", "Bishops_Opening", "Slav_Defense", "Pirc_Defense", "Kings_Pawn_Game", "Vienna_Game", "Queens_Gambit_Accepted", "Kings_Indian_Defense", "Benoni_Defense", "Nimzowitsch_Defense", "Alekhine_Defense", "Nimzo-Larsen_Attack", "Horwitz_Defense", "Kings_Gambit_Declined", "Owen_Defense", "Bird_Opening", "Dutch_Defense", "Nimzo-Indian_Defense", "Vant_Kruijs_Opening", "Semi-Slav_Defense", "Center_Game", "Hungarian_Opening", "Englund_Gambit_Complex", "Three_Knights_Opening", "Ponziani_Opening", "Englund_Gambit", "Grunfeld_Defense", "Blackmar-Diemer_Gambit", "Elephant_Gambit", "Polish_Opening", "Danish_Gambit", "Kings_Indian_Attack", "Rat_Defense", "Kings_Gambit", "Trompowsky_Attack", "English_Defense", "Grob_Opening", "Rapport-Jobava_System", "Kings_Knight_Opening", "Van_Geet_Opening", "Tarrasch_Defense", "Old_Indian_Defense", "Danish_Gambit_Accepted", "Catalan_Opening", "Reti_Opening", "Queens_Indian_Defense", "London_System"])
    @IsOptional()
    openingFamily?: string;


    @IsString()
    @IsIn(['w', 'b', 'N/A'])
    @IsOptional()
    color?: 'w' | 'b' | 'N/A';

    @IsInt()
    @Min(1)
    @Max(200)
    @IsOptional()
    countToReturn?: number;
}
