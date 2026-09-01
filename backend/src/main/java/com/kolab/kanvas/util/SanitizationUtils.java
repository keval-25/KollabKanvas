package com.kolab.kanvas.util;

public class SanitizationUtils {

    public static String sanitizeText(String input) {
        if (input == null) return null;
        return input.replaceAll("<script.*?>.*?</script>", "")
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;");
    }
}
