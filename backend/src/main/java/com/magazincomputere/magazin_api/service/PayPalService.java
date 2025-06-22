package com.magazincomputere.magazin_api.service;

import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PayPalService {
    
    @Autowired
    private PayPalHttpClient payPalHttpClient;
    
    public Order createOrder(Double totalAmount, String currency, String returnUrl, String cancelUrl) throws IOException {
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.checkoutPaymentIntent("CAPTURE");
        
        ApplicationContext applicationContext = new ApplicationContext()
            .brandName("VipeX Technology")
            .landingPage("BILLING")
            .returnUrl(returnUrl)
            .cancelUrl(cancelUrl)
            .userAction("CONTINUE");
        orderRequest.applicationContext(applicationContext);
        
        List<PurchaseUnitRequest> purchaseUnits = new ArrayList<>();
        PurchaseUnitRequest purchaseUnit = new PurchaseUnitRequest()
            .amountWithBreakdown(new AmountWithBreakdown()
                .currencyCode(currency)
                .value(String.format("%.2f", totalAmount)));
        purchaseUnits.add(purchaseUnit);
        orderRequest.purchaseUnits(purchaseUnits);
        
        OrdersCreateRequest ordersCreateRequest = new OrdersCreateRequest()
            .requestBody(orderRequest);
        
        HttpResponse<Order> response = payPalHttpClient.execute(ordersCreateRequest);
        return response.result();
    }
    
    public Order captureOrder(String orderId) throws IOException {
        OrdersCaptureRequest ordersCaptureRequest = new OrdersCaptureRequest(orderId);
        HttpResponse<Order> response = payPalHttpClient.execute(ordersCaptureRequest);
        return response.result();
    }
}