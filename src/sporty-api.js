import { request } from 'undici';

export const COMP_IDS = {
    'CRL': 10329,
    'OPEN_GRADE_HADLEY': 11124,
}

export const ORG_IDS = {
    'PANTHERS': 9251,
    'RICCARTON': 7571
}

export const GRADE_IDS = {
    'PREMS': 464560,
    'BS': 464561,
    'SATURDAY': 716043,
}

export const getFixturesApi = async (fixturesReq) => {
    const year = new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const body = JSON.stringify({
        From: yearStart,
        To: yearEnd,
        CompIds: [fixturesReq.compId],
        GradeIds: [fixturesReq.gradeId],
        OrgIds: [fixturesReq.orgId]
    });
    
    return await request('https://www.sporty.co.nz/api/v2/competition/widget/fixture/Dates', {
        method: 'POST',
        headers: {
            'User-Agent': 'PostmanRuntime/7.43.4',
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Postman-Token': crypto.randomUUID() // mimic Postman randomness
        },
        body
    });
}