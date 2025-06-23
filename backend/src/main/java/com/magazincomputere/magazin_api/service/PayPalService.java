package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.model.Order;
import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Service
public class PayPalService {

    @Autowired
    private PayPalHttpClient payPalHttpClient;

    public com.paypal.orders.Order createOrder(Double amount, String currency, String returnUrl, String cancelUrl) throws IOException {
        OrdersCreateRequest request = new OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody(buildRequestBody(amount, currency, returnUrl, cancelUrl));

        HttpResponse<com.paypal.orders.Order> response = payPalHttpClient.execute(request);
        return response.result();
    }

    public com.paypal.orders.Order captureOrder(String orderId) throws IOException {
        OrdersCaptureRequest request = new OrdersCaptureRequest(orderId);
        request.requestBody(new OrderRequest());

        HttpResponse<com.paypal.orders.Order> response = payPalHttpClient.execute(request);
        return response.result();
    }

    private OrderRequest buildRequestBody(Double amount, String currency, String returnUrl, String cancelUrl) {
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.checkoutPaymentIntent("CAPTURE");

        // Use Locale.US to ensure the decimal separator is a period (.)
        String formattedAmount = String.format(Locale.US, "%.2f", amount);

        AmountWithBreakdown amountWithBreakdown = new AmountWithBreakdown().currencyCode(currency).value(formattedAmount);

        // --- CORRECTED CODE ---
        // Create a new PurchaseUnitRequest and set the amount using amountWithBreakdown()
        PurchaseUnitRequest purchaseUnitRequest = new PurchaseUnitRequest();
        purchaseUnitRequest.amountWithBreakdown(amountWithBreakdown);  // Changed from amount() to amountWithBreakdown()

        orderRequest.purchaseUnits(List.of(purchaseUnitRequest));

        ApplicationContext applicationContext = new ApplicationContext()
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl);
        orderRequest.applicationContext(applicationContext);

        return orderRequest;
    }
}