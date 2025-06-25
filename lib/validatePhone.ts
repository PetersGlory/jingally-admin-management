import { isValidPhoneNumber, parsePhoneNumber, CountryCode } from 'libphonenumber-js';

interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
}

/**
 * Validates a phone number and returns validation result
 * @param phoneNumber - The phone number to validate
 * @param countryCode - Optional country code (e.g., 'US', 'GB', 'NG')
 * @returns PhoneValidationResult object containing validation status and additional info
 */
export const validatePhoneNumber = (
  phoneNumber: string,
  countryCode?: CountryCode
): PhoneValidationResult => {
  try {
    // Remove any whitespace from the phone number
    const cleanNumber = phoneNumber.replace(/\s+/g, '');

    // If no country code is provided, try to validate as is
    if (!countryCode) {
      if (!isValidPhoneNumber(cleanNumber)) {
        return {
          isValid: false,
          error: 'Invalid phone number format'
        };
      }
    } else {
      // Validate with specific country code
      if (!isValidPhoneNumber(cleanNumber, countryCode)) {
        return {
          isValid: false,
          error: `Invalid phone number for country code: ${countryCode}`
        };
      }
    }

    // If valid, parse and format the number
    const parsedNumber = parsePhoneNumber(cleanNumber, countryCode);
    
    return {
      isValid: true,
      formattedNumber: parsedNumber.format('INTERNATIONAL')
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Error validating phone number'
    };
  }
};

/**
 * Formats a phone number to international format
 * @param phoneNumber - The phone number to format
 * @param countryCode - Optional country code
 * @returns Formatted phone number or null if invalid
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode?: CountryCode
): string | null => {
  try {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    const parsedNumber = parsePhoneNumber(cleanNumber, countryCode);
    return parsedNumber.format('INTERNATIONAL');
  } catch (error) {
    return null;
  }
};
