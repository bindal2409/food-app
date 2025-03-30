import {MailtrapClient} from "mailtrap";
import dotenv from "dotenv";
dotenv.config();

const ENDPOINT= "https://send.api.mailtrap.io/";

export const client = new MailtrapClient({
     token: process.env.MAILTRAP_API_TOKEN!
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Bindal MernStack",
};