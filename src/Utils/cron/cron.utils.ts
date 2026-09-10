import cron from "node-cron";
import UserModel from "../../DB/Models/User.model.js";

export const initCronJobs = (): void => {
  cron.schedule("0 */6 * * *", async () => {
    try {
      const result = await UserModel.updateMany({ "OTP.expiresIn": { $lt: new Date() } }, { $unset: { OTP: "" } });
      console.log(`[CRON] Expired OTPs cleaned up successfully. Modified count: ${result.modifiedCount}`);
    } catch (error) {
      console.error("[CRON] Failed to clean up expired OTPs:", error);
    }
  });
};
