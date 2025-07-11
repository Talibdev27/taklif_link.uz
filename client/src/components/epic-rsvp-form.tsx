import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertGuestSchema } from '@shared/schema';

const rsvpFormSchema = insertGuestSchema.extend({
  email: z.string().email().optional().or(z.literal('')),
});

type RSVPFormData = z.infer<typeof rsvpFormSchema>;

interface EpicRSVPFormProps {
  weddingId: number;
  primaryColor?: string;
  accentColor?: string;
}

export function EpicRSVPForm({ weddingId, primaryColor = '#1976d2', accentColor = '#1565c0' }: EpicRSVPFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      weddingId,
      name: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      additionalGuests: 0,
      dietaryRestrictions: '',
      message: '',
    },
  });

  const submitRSVP = useMutation({
    mutationFn: async (data: RSVPFormData) => {
      const response = await fetch(`/api/weddings/${weddingId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit RSVP');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('rsvp.thankYou'),
        description: t('rsvp.thankYouMessage'),
      });
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: [`/api/guests/wedding/${weddingId}`] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('rsvp.errorMessage'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RSVPFormData) => {
    submitRSVP.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
        >
          <span className="text-white text-2xl">✓</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('rsvp.thankYou')}</h3>
        <p className="text-gray-600">{t('rsvp.thankYouMessage')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="text-center py-8 px-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">{t('rsvp.title')}</h3>
          <p className="text-gray-600">{t('rsvp.subtitle')}</p>
        </div>
        
        {/* Form Content */}
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Guest Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm">{t('rsvp.guestName')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('rsvp.enterFullName')} 
                        {...field} 
                        className="h-12 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RSVP Status with beautiful radio buttons */}
              <FormField
                control={form.control}
                name="rsvpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm">{t('rsvp.willYouAttend')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Set additionalGuests to 1 when confirmed_with_guest is selected
                          if (value === 'confirmed_with_guest') {
                            form.setValue('additionalGuests', 1);
                            form.setValue('plusOne', true);
                          } else {
                            form.setValue('additionalGuests', 0);
                            form.setValue('plusOne', false);
                          }
                        }}
                        defaultValue={field.value}
                        className="space-y-3 mt-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200">
                          <RadioGroupItem 
                            value="confirmed" 
                            id="confirmed" 
                            className="border-2 border-green-400 text-green-600"
                          />
                          <Label htmlFor="confirmed" className="text-gray-700 font-medium cursor-pointer flex-1">
                            ✅ {t('rsvp.confirmedEmoji')}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                          <RadioGroupItem 
                            value="confirmed_with_guest" 
                            id="confirmed_with_guest" 
                            className="border-2 border-blue-400 text-blue-600"
                          />
                          <Label htmlFor="confirmed_with_guest" className="text-gray-700 font-medium cursor-pointer flex-1">
                            👥 {t('rsvp.confirmedWithGuest')}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all duration-200">
                          <RadioGroupItem 
                            value="declined" 
                            id="declined" 
                            className="border-2 border-red-400 text-red-600"
                          />
                          <Label htmlFor="declined" className="text-gray-700 font-medium cursor-pointer flex-1">
                            ❌ {t('rsvp.declinedEmoji')}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/30 transition-all duration-200">
                          <RadioGroupItem 
                            value="maybe" 
                            id="maybe" 
                            className="border-2 border-yellow-400 text-yellow-600"
                          />
                          <Label htmlFor="maybe" className="text-gray-700 font-medium cursor-pointer flex-1">
                            🤔 {t('rsvp.maybeEmoji')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm">{t('rsvp.message')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('rsvp.shareMessage')} 
                        {...field} 
                        value={field.value || ''}
                        className="min-h-[100px] border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Beautiful Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
                disabled={submitRSVP.isPending}
              >
                {submitRSVP.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('rsvp.submit')
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}