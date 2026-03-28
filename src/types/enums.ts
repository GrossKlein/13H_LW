export type ClaimType = "factual_assertion" | "legal_position" | "sworn_statement" | "allegation" | "expert_opinion";
export type ClaimStatus = "alleged" | "supported" | "contradicted" | "judicially_addressed";
export type ReviewStatus = "unreviewed" | "analyst_validated" | "litigation_ready";
export type EvidenceType = "email" | "deposition" | "pleading" | "affidavit" | "expert_report" | "photograph" | "video" | "court_order" | "correspondence";
export type ReliabilityLevel = "primary_record" | "sworn_statement" | "secondary_reference" | "internal_note";
export type EventType = "filing" | "communication" | "inspection" | "ruling" | "transaction" | "modification" | "demand" | "obstruction";
export type DateCertainty = "exact" | "approximate" | "inferred";
export type ArgumentExportFormat = "structured_packet" | "narrative";
