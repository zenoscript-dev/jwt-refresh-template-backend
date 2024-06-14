export class UserTokenPayload {
    id: string;
    roles: string[];
    namespace: string;
    expiresIn: number;
}