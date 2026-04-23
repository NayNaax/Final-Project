import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './backend/src/lib/jwtSecret';
import axios from 'axios';

async function test() {
    const secret = getJwtSecret();
    const token = jwt.sign({ userId: 7, email: 'nom@gmail.com' }, secret!);
    try {
        const res = await axios.get('http://localhost:3001/api/learn/progress', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(res.data);
    } catch(err: any) {
        console.log(err.response?.data || err.message);
    }
}
test();
