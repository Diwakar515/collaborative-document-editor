package com.docs.dto;

import lombok.Data;
import java.util.List;

@Data
public class PaginatedResponse<T> {

    private List<T> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}