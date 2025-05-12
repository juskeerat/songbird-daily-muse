
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .regex(/^[0-9+\-\s()]*$/, { message: 'Invalid phone number format' }),
});

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => void;
}

const PhoneNumberForm = ({ onSubmit }: PhoneNumberFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsSubmitting(true);
    try {
      // Process form submission
      onSubmit(values.phoneNumber);
      
      toast({
        title: "Phone number saved",
        description: "You'll now receive daily song recommendations via SMS.",
      });
    } catch (error) {
      console.error('Error submitting phone number:', error);
      toast({
        title: "Error",
        description: "Failed to save your phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl bg-gradient-card">
      <h2 className="text-xl font-bold text-white mb-2">Get Daily Recommendations</h2>
      <p className="text-spotify-lightgray mb-4">
        We'll text you a new song recommendation every day with an AI-generated summary of why you might like it.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white"
          >
            {isSubmitting ? 'Saving...' : 'Sign Up for Daily Texts'}
          </Button>
        </form>
      </Form>
      
      <p className="text-xs text-muted-foreground mt-2">
        Standard messaging rates may apply. You can unsubscribe at any time by replying STOP to our texts.
      </p>
    </div>
  );
};

export default PhoneNumberForm;
