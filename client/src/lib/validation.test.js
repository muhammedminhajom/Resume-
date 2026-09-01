import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateDateOrder,
  validatePersonalInfo,
  validateEducation,
  validateExperience,
  validateProjects,
  validateCertifications,
  isSectionValid,
} from './validation';

describe('validation', () => {
  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
      expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('spaces in@email.com')).toBe(false);
    });

    it('returns true for empty/optional email', () => {
      expect(validateEmail('')).toBe(true);
      expect(validateEmail(null)).toBe(true);
      expect(validateEmail(undefined)).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('returns true for valid phones', () => {
      expect(validatePhone('(555) 123-4567')).toBe(true);
      expect(validatePhone('555-123-4567')).toBe(true);
      expect(validatePhone('+1 555 123 4567')).toBe(true);
      expect(validatePhone('5551234567')).toBe(true);
    });

    it('returns false for invalid phones', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc-def-ghij')).toBe(false);
    });

    it('returns true for empty/optional phone', () => {
      expect(validatePhone('')).toBe(true);
      expect(validatePhone(null)).toBe(true);
    });
  });

  describe('validateDateOrder', () => {
    it('returns true for valid date order', () => {
      expect(validateDateOrder('2020', '2022')).toBe(true);
      expect(validateDateOrder('2020', 'Present')).toBe(true);
      expect(validateDateOrder('2020', 'present')).toBe(true);
    });

    it('returns false for invalid date order', () => {
      expect(validateDateOrder('2022', '2020')).toBe(false);
    });

    it('returns true for empty dates', () => {
      expect(validateDateOrder('', '2020')).toBe(true);
      expect(validateDateOrder('2020', '')).toBe(true);
      expect(validateDateOrder('', '')).toBe(true);
    });

    it('returns true for non-numeric dates', () => {
      expect(validateDateOrder('Jan 2020', 'Dec 2020')).toBe(true);
    });
  });

  describe('validatePersonalInfo', () => {
    it('returns errors for missing required fields', () => {
      const errors = validatePersonalInfo({});
      expect(errors.name).toBe('Full name is required.');
      expect(errors.email).toBe('Email is required.');
    });

    it('returns error for invalid email', () => {
      const errors = validatePersonalInfo({ name: 'John', email: 'invalid' });
      expect(errors.email).toBe('Invalid email format.');
    });

    it('returns error for invalid phone', () => {
      const errors = validatePersonalInfo({ name: 'John', email: 'john@example.com', phone: '123' });
      expect(errors.phone).toBe('Invalid phone number format.');
    });

    it('returns empty object for valid info', () => {
      const errors = validatePersonalInfo({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
      });
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('validateEducation', () => {
    it('returns errors for missing required fields', () => {
      const errors = validateEducation([{}]);
      expect(errors[0].errors.institution).toBe('Institution is required.');
      expect(errors[0].errors.degree).toBe('Degree is required.');
      expect(errors[0].errors.field).toBe('Field of study is required.');
    });

    it('returns error for invalid date order', () => {
      const errors = validateEducation([{ institution: 'Uni', degree: 'BS', field: 'CS', start_date: '2022', end_date: '2020' }]);
      expect(errors[0].errors.end_date).toBe('End date must be after start date.');
    });

    it('returns empty array for valid education', () => {
      const errors = validateEducation([{
        institution: 'University',
        degree: 'B.S.',
        field: 'Computer Science',
        start_date: '2018',
        end_date: '2022',
      }]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateExperience', () => {
    it('returns errors for missing required fields', () => {
      const errors = validateExperience([{}]);
      expect(errors[0].errors.role).toBe('Job title is required.');
      expect(errors[0].errors.company).toBe('Company is required.');
      expect(errors[0].errors.bullets).toBe('At least one bullet point is required.');
    });

    it('returns error for invalid date order', () => {
      const errors = validateExperience([{ role: 'Dev', company: 'Co', start_date: '2022', end_date: '2020', bullets: ['Did stuff'] }]);
      expect(errors[0].errors.end_date).toBe('End date must be after start date.');
    });

    it('returns empty array for valid experience', () => {
      const errors = validateExperience([{
        role: 'Developer',
        company: 'Acme',
        start_date: '2020',
        end_date: 'Present',
        bullets: ['Built things'],
      }]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateProjects', () => {
    it('returns errors for missing required fields', () => {
      const errors = validateProjects([{}]);
      expect(errors[0].errors.title).toBe('Project title is required.');
      expect(errors[0].errors.description).toBe('Description is required.');
    });

    it('returns empty array for valid projects', () => {
      const errors = validateProjects([{
        title: 'My Project',
        description: 'Does cool stuff',
      }]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateCertifications', () => {
    it('returns errors for missing required fields', () => {
      const errors = validateCertifications([{}]);
      expect(errors[0].errors.name).toBe('Certification name is required.');
      expect(errors[0].errors.issuer).toBe('Issuer is required.');
    });

    it('returns empty array for valid certifications', () => {
      const errors = validateCertifications([{
        name: 'AWS Cert',
        issuer: 'Amazon',
        date: '2023',
      }]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('isSectionValid', () => {
    it('returns true for valid personal_info', () => {
      const resume = { personal_info: { name: 'John', email: 'john@example.com' } };
      expect(isSectionValid(resume, 'personal_info')).toBe(true);
    });

    it('returns false for invalid personal_info', () => {
      const resume = { personal_info: { name: '', email: '' } };
      expect(isSectionValid(resume, 'personal_info')).toBe(false);
    });

    it('returns true for skills (no validation)', () => {
      const resume = { skills: [] };
      expect(isSectionValid(resume, 'skills')).toBe(true);
    });
  });
});