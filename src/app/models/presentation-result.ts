export interface PresentationResult {
    id: string;
    created: Date;
    finished?: Date;
    wellbeing: number[];
    question1: string;
    question2: string;
    question3: string;
    responses1: number[];
    responses2: number[];
    responses3: number[];
}
