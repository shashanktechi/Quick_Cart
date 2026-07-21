package com.quickcart.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://database-1.cu3ikoym0hs3.us-east-1.rds.amazonaws.com:5432/postgres", "admin123", "Sunny2005");
            Statement stmt = conn.createStatement();
            System.out.println("---- ALL STORES ----");
            ResultSet rs = stmt.executeQuery("SELECT id, name, city, verification_status FROM stores");
            while (rs.next()) {
                System.out.println(rs.getInt("id") + " | " + rs.getString("name") + " | " + rs.getString("city") + " | " + rs.getString("verification_status"));
            }
            rs.close();
            stmt.close();
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
