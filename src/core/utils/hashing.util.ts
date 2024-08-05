import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class HashingUtil {
  constructor() {}

  async generateHashedPassword(): Promise<object> {
    try {
      const password = await this.generatePassword(16, '$#-');
      console.log('red', password);
      const saltRounds = 10; // You can adjust the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return { hashedPassword: hashedPassword, password: password };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'failed to hash the password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generatePassword(
    length = 12,
    customSpecialChars = '',
  ): Promise<string> {
    try {
      const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
      const uppercaseLetters = lowercaseLetters.toUpperCase();
      const numbers = '0123456789';

      // Allow customization of special characters
      const specialCharacters =
        customSpecialChars || '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?';

      const allChars =
        lowercaseLetters + uppercaseLetters + numbers + specialCharacters;

      // Ensure at least one character from each category using crypto.randomBytes
      const categories: string[] = [
        lowercaseLetters,
        uppercaseLetters,
        numbers,
        specialCharacters.length > 0 ? specialCharacters : '',
      ]; // Include special characters only if they exist
      const chosenCategories = new Set<string>();
      while (chosenCategories.size < Math.min(4, categories.length)) {
        // Ensure at least 3 (or less if no special characters) categories
        const randomIndex = Math.floor(randomBytes(1)[0] % categories.length);
        chosenCategories.add(categories[randomIndex]);
      }

      let password = '';
      for (const category of chosenCategories) {
        password += category[Math.floor(randomBytes(1)[0] % category.length)];
      }

      // Fill remaining characters with any character from the combined set
      for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(randomBytes(1)[0] % allChars.length)];
      }

      // Shuffle the characters using Fisher-Yates (Knuth) shuffle (without modifying the original string)
      const passwordArray = password.split('');
      for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(randomBytes(1)[0] % (i + 1));
        [passwordArray[i], passwordArray[j]] = [
          passwordArray[j],
          passwordArray[i],
        ];
      }

      // Join the shuffled array back into a string
      password = passwordArray.join('');

      // Ensure password length is within the specified range
      return password.slice(0, length);
    } catch (error) {
      throw new Error('Failed to generate password');
    }
  }
}
