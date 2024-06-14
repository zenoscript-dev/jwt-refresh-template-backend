export class LoginResponse{
    employeeId: string;
    otp?: number;
    accessToken: string;
    refreshToken: string;
    nextPage?: string;
    timer?: number;
}