// components/payments/PaymentMethodForm.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { useElements, useStripe, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod } from "@shared/schema";

export function PaymentMethodForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const auth = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  // Fetch existing payment methods
  const { data: paymentMethods } = useQuery<PaymentMethod[]>({
    queryKey: ['payment-methods', auth.user?.id],
    queryFn: () => fetch(`/api/user/${auth.user?.id}/payment-methods`).then(res => res.json()),
    enabled: !!auth.user?.id
  });

  const addPaymentMethod = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) {
        throw new Error('Stripe not initialized');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw error;
      }

      return fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: auth.user?.id,
          paymentMethodId: paymentMethod.id,
        }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: t('payment.methodAdded'),
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('payment.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const setDefaultMethod = useMutation({
    mutationFn: async (methodId: string) => {
      return fetch(`/api/payment-methods/${methodId}/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: auth.user?.id,
        }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: t('payment.defaultSet'),
        variant: 'success',
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">{t('payment.addNewMethod')}</h3>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
        <Button
          className="mt-4"
          onClick={() => addPaymentMethod.mutate()}
          disabled={addPaymentMethod.isPending}
        >
          {addPaymentMethod.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t('payment.saveMethod')}
        </Button>
      </div>

      {paymentMethods && paymentMethods.length > 0 && (
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">{t('payment.yourMethods')}</h3>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  method.isDefault ? 'border-primary' : ''
                }`}
              >
                <div>
                  <p className="font-medium">
                    {method.cardBrand} **** **** **** {method.cardLast4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {method.cardExpMonth}/{method.cardExpYear}
                  </p>
                </div>
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    onClick={() => setDefaultMethod.mutate(method.id)}
                    disabled={setDefaultMethod.isPending}
                  >
                    {t('payment.setDefault')}
                  </Button>
                )}
                {method.isDefault && (
                  <span className="text-sm text-primary">
                    {t('payment.default')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}