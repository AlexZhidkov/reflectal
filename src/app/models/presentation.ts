export interface Presentation {
    id: string;
    teamId: string;
    created: Date;
    finished?: Date;
    questions: string[];
    responses?: Response[];
}

export interface Response {
    id: string;
    started: Date;
    completed?: Date;
    wellbeing: number;
    q1?: number;
    q2?: number;
    q3?: number;
}
