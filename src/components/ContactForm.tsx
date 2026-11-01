import React, { useState } from 'react';
import { graphQLClient } from '../graphql/client';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      setStatus('error');
      setErrorMessage('Please provide a message with at least 10 characters.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await graphQLClient.execute(
        `mutation SubmitContact($input: ContactInput!) {
          submitContact(input: $input) {
            id
            name
            email
            submittedAt
            status
          }
        }`,
        {
          input: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            message: formData.message.trim(),
          },
        }
      );

      if (response.data?.submitContact) {
        setSubmittedId(response.data.submitContact.id);
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage('Failed to send message. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h3 className="font-editorial text-2xl font-semibold text-stone-900">
          Send Us an Inquiry
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
          Have questions about our botanical formulas, wholesale distribution, or personalized routine consultations? Fill out the form below.
        </p>
      </div>

      {status === 'success' ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-editorial text-xl font-semibold text-stone-900">
              Message Transmitted
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              Thank you for reaching out to Koléa Cosmetic. Our formulation team will review your inquiry and respond within 24 business hours.
            </p>
            {submittedId && (
              <p className="text-[11px] font-mono text-stone-400 pt-1">
                Receipt ID: {submittedId}
              </p>
            )}
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sarah Mansouri"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Your Message *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your skin concerns, product inquiry, or boutique visit request..."
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? (
              <span>Transmitting...</span>
            ) : (
              <>
                <span>Submit Message</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
