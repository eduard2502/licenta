package com.magazincomputere.magazin_api.dto;

import lombok.Data;

@Data
public class PayPalOrderResponse {
    private String orderId;
    private String status;
    private String approvalUrl;
}