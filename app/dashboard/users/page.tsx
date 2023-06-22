import { Suspense } from 'react';
import { UsersTable, dataFromServer } from "./userTable";

async function getData(): Promise<dataFromServer> {
    const res = await fetch('http://localhost:3000/api/users')
    // Recommendation: handle errors
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export default async function users() {
    const users = await getData()
    return (
        <Suspense fallback={
            <div>Loading...</div>
        }>
            <UsersTable users={users} />
        </Suspense>
    );
}
