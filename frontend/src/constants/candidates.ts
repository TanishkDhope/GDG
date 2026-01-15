export interface Candidate {
    id: string
    name: string
    party: string
    partySymbol: string
    education: string
    workSummary: string
    additionalInfo: string
    state: string
    district: string
    ward: string
}

export const CANDIDATES: Candidate[] = [
    {
        id: "1",
        name: "Rajesh Kumar",
        party: "National Progressive Party",
        partySymbol: "🌾",
        education: "B.A., M.A. Political Science from Delhi University",
        workSummary: "20 years of experience in public administration and social welfare programs",
        additionalInfo:
            "Rajesh Kumar has successfully led multiple infrastructure development projects, housing schemes for underprivileged citizens, and education initiatives across the district.",
        state: "Maharashtra",
        district: "Mumbai South",
        ward: "Ward 45",
    },
    {
        id: "2",
        name: "Priya Sharma",
        party: "Democratic Alliance",
        partySymbol: "🏛️",
        education: "B.Tech IIT Mumbai, MBA from XLRI",
        workSummary: "15 years in education and infrastructure development",
        additionalInfo:
            "Priya has established tech parks, skill development centers, and has worked extensively on digital literacy programs benefiting thousands of citizens.",
        state: "Maharashtra",
        district: "Mumbai South",
        ward: "Ward 45",
    },
    {
        id: "3",
        name: "Arjun Singh",
        party: "People's United Front",
        partySymbol: "⭐",
        education: "B.Sc, M.Sc Environmental Science from JNU",
        workSummary: "12 years focused on environmental protection and sustainable development",
        additionalInfo:
            "Arjun has led several green initiatives, water conservation projects, and has been instrumental in reducing pollution levels in urban areas.",
        state: "Maharashtra",
        district: "Mumbai South",
        ward: "Ward 45",
    },
    {
        id: "4",
        name: "Meera Patel",
        party: "Inclusive Growth Movement",
        partySymbol: "🤝",
        education: "B.Com, M.Com Economics from Mumbai University",
        workSummary: "18 years in economic development and poverty alleviation programs",
        additionalInfo:
            "Meera has implemented microfinance schemes, women entrepreneurship programs, and has focused on creating sustainable employment opportunities.",
        state: "Maharashtra",
        district: "Mumbai South",
        ward: "Ward 45",
    },
]
