"""Questionnaire and Profile Schema for Citizen Eligibility Determination.

Maps profile attributes to bilingual questions, input controls, categories, and guidance.
"""

from typing import Any, Dict, List


ELIGIBILITY_QUESTIONS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------
    # Category: Demographic & Location
    # -------------------------------------------------------------
    {
        "id": "q_age",
        "field": "age",
        "category": "demographic",
        "type": "number",
        "label_en": "What is your current age?",
        "label_hi": "आपकी वर्तमान आयु क्या है?",
        "placeholder_en": "Enter age in years (e.g. 45)",
        "placeholder_hi": "वर्षों में आयु दर्ज करें (उदा. 45)",
        "min": 0,
        "max": 120,
        "required": True,
        "tooltip_en": "Age determines qualification for senior citizen top-ups, old age pensions, and youth scholarships.",
        "tooltip_hi": "आयु वरिष्ठ नागरिक योजनाओं, वृद्धावस्था पेंशन और युवा छात्रवृत्ति की पात्रता तय करती है।"
    },
    {
        "id": "q_state",
        "field": "state",
        "category": "demographic",
        "type": "select",
        "label_en": "State or Union Territory of Permanent Domicile",
        "label_hi": "स्थायी निवास का राज्य / केंद्र शासित प्रदेश",
        "options": [
            {"value": "UK", "label_en": "Uttarakhand (उत्तराखंड)", "label_hi": "उत्तराखंड"},
            {"value": "UP", "label_en": "Uttar Pradesh (उत्तर प्रदेश)", "label_hi": "उत्तर प्रदेश"},
            {"value": "DL", "label_en": "Delhi (दिल्ली)", "label_hi": "दिल्ली"},
            {"value": "MH", "label_en": "Maharashtra (महाराष्ट्र)", "label_hi": "महाराष्ट्र"},
            {"value": "BR", "label_en": "Bihar (बिहार)", "label_hi": "बिहार"},
            {"value": "MP", "label_en": "Madhya Pradesh (मध्य प्रदेश)", "label_hi": "मध्य प्रदेश"},
            {"value": "RJ", "label_en": "Rajasthan (राजस्थान)", "label_hi": "राजस्थान"},
            {"value": "OTHER", "label_en": "Other State / UT", "label_hi": "अन्य राज्य / केंद्र शासित प्रदेश"}
        ],
        "required": True,
        "tooltip_en": "Certain state-sponsored welfare programs require permanent domicile.",
        "tooltip_hi": "कुछ राज्य-प्रायोजित कल्याणकारी योजनाओं हेतु स्थायी निवास अनिवार्य है।"
    },
    {
        "id": "q_is_rural",
        "field": "is_rural_resident",
        "category": "demographic",
        "type": "boolean",
        "label_en": "Do you reside in a rural village / Gram Panchayat area?",
        "label_hi": "क्या आप ग्रामीण क्षेत्र / ग्राम पंचायत में निवास करते हैं?",
        "required": True,
        "tooltip_en": "PMAY-G and rural livelihood benefits apply strictly to rural residents.",
        "tooltip_hi": "पीएम आवास ग्रामीण एवं ग्रामीण आजीविका लाभ केवल ग्रामीण निवासियों के लिए हैं।"
    },

    # -------------------------------------------------------------
    # Category: Agriculture & Farming
    # -------------------------------------------------------------
    {
        "id": "q_is_farmer",
        "field": "is_farmer",
        "category": "agriculture",
        "type": "boolean",
        "label_en": "Are you or your family engaged in farming / agriculture?",
        "label_hi": "क्या आप या आपका परिवार कृषि / खेती से जुड़ा है?",
        "required": True,
        "tooltip_en": "Required for PM-KISAN, crop insurance, and Kisan Credit Card.",
        "tooltip_hi": "पीएम-किसान, फसल बीमा एवं किसान क्रेडिट कार्ड हेतु आवश्यक।"
    },
    {
        "id": "q_owns_land",
        "field": "owns_cultivable_land",
        "category": "agriculture",
        "type": "boolean",
        "label_en": "Do you own cultivable agricultural land in your name?",
        "label_hi": "क्या आपके नाम पर कृषि योग्य भूमि दर्ज है?",
        "required": False,
        "depends_on": {"field": "is_farmer", "value": True},
        "tooltip_en": "PM-KISAN guidelines require ownership of cultivable land as per state revenue records.",
        "tooltip_hi": "पीएम-किसान दिशा-निर्देशों के अनुसार राजस्व अभिलेखों में भूमि स्वामित्व आवश्यक है।"
    },

    # -------------------------------------------------------------
    # Category: Identity & Biometrics (Official Verification)
    # -------------------------------------------------------------
    {
        "id": "q_has_aadhaar",
        "field": "has_aadhaar",
        "category": "identity",
        "type": "boolean",
        "label_en": "Do you have an active Aadhaar card seeded with your bank account?",
        "label_hi": "क्या आपके पास बैंक खाते से लिंक सक्रिय आधार कार्ड है?",
        "required": True,
        "tooltip_en": "Mandatory for DBT cash assistance release.",
        "tooltip_hi": "डीबीटी नकद सहायता अंतरण हेतु अनिवार्य।"
    },
    {
        "id": "q_ekyc_completed",
        "field": "ekyc_completed",
        "category": "identity",
        "type": "boolean",
        "label_en": "Have you completed biometric or OTP e-KYC on the scheme portal?",
        "label_hi": "क्या आपने योजना पोर्टल पर बायोमेट्रिक या ओटीपी ई-केवाईसी पूरा कर लिया है?",
        "required": False,
        "official_verification_required": True,
        "tooltip_en": "Required for 13th installment onwards under PM-KISAN.",
        "tooltip_hi": "पीएम-किसान की 13वीं किस्त से आगे के लाभ हेतु अनिवार्य।"
    },

    # -------------------------------------------------------------
    # Category: Housing & Living Conditions
    # -------------------------------------------------------------
    {
        "id": "q_has_pucca_house",
        "field": "has_pucca_house",
        "category": "housing",
        "type": "boolean",
        "label_en": "Do you or your family own a permanent (pucca) house anywhere in India?",
        "label_hi": "क्या आपके या आपके परिवार के पास भारत में कहीं भी पक्का मकान है?",
        "required": True,
        "tooltip_en": "Houseless and kutcha house residents are prioritized for housing subsidies.",
        "tooltip_hi": "बेघर एवं कच्चे मकान में रहने वाले परिवारों को आवास अनुदान में प्राथमिकता मिलती है।"
    },

    # -------------------------------------------------------------
    # Category: Income, Economic Status & SECC
    # -------------------------------------------------------------
    {
        "id": "q_annual_income",
        "field": "annual_income",
        "category": "income",
        "type": "number",
        "label_en": "Total Annual Family Income (in INR)",
        "label_hi": "परिवार की कुल वार्षिक आय (रुपये में)",
        "placeholder_en": "e.g. 120000",
        "placeholder_hi": "उदा. 120000",
        "required": True,
        "tooltip_en": "Income limits apply for pensions, scholarships, and economic welfare.",
        "tooltip_hi": "पेंशन, छात्रवृत्ति और आर्थिक कल्याण हेतु आय सीमा लागू होती है।"
    },
    {
        "id": "q_is_bpl",
        "field": "is_bpl",
        "category": "income",
        "type": "boolean",
        "label_en": "Does your family hold a Below Poverty Line (BPL) or Antyodaya ration card?",
        "label_hi": "क्या आपके परिवार के पास बीपीएल (BPL) या अंत्योदय राशन कार्ड है?",
        "required": True,
        "tooltip_en": "Key qualifier for Ayushman Bharat, subsidized foodgrains, and state pensions.",
        "tooltip_hi": "आयुष्मान भारत, रियायती खाद्यान्न और राज्य पेंशन के लिए प्रमुख पात्रता।"
    },
    {
        "id": "q_secc_deprived",
        "field": "secc_deprived",
        "category": "income",
        "type": "boolean",
        "label_en": "Is your household covered under SECC 2011 deprivation criteria (D1-D7)?",
        "label_hi": "क्या आपका परिवार सामाजिक-आर्थिक जाति जनगणना (SECC 2011) अभाव सूची में शामिल है?",
        "required": False,
        "official_verification_required": True,
        "tooltip_en": "Automatic inclusion criterion for PM-JAY and PMAY-G.",
        "tooltip_hi": "पीएम-जेएवाई और पीएमएवाई-जी के लिए स्वतः समावेशन शर्त।"
    },

    # -------------------------------------------------------------
    # Category: Statutory Exclusions (Disqualification Precedence)
    # -------------------------------------------------------------
    {
        "id": "q_tax_payer",
        "field": "is_income_tax_payer",
        "category": "exclusions",
        "type": "boolean",
        "label_en": "Did you or any member of your family pay income tax in the last financial year?",
        "label_hi": "क्या आपने या आपके परिवार के किसी सदस्य ने पिछले वित्तीय वर्ष में आयकर दिया है?",
        "required": True,
        "tooltip_en": "Income tax payers are excluded by statute from PM-KISAN and BPL assistance.",
        "tooltip_hi": "आयकर दाता कानूनन पीएम-किसान और बीपीएल सहायता से बाहर हैं।"
    },
    {
        "id": "q_inst_holder",
        "field": "is_institutional_landholder",
        "category": "exclusions",
        "type": "boolean",
        "label_en": "Is the agricultural land registered to an institution, trust, or company?",
        "label_hi": "क्या कृषि भूमि किसी संस्था, ट्रस्ट या कंपनी के नाम पर दर्ज है?",
        "required": False,
        "tooltip_en": "Only individual farming families are eligible for farmer cash assistance.",
        "tooltip_hi": "केवल व्यक्तिगत कृषक परिवार ही किसान नकद सहायता के पात्र हैं।"
    },
    {
        "id": "q_const_holder",
        "field": "is_constitutional_post_holder",
        "category": "exclusions",
        "type": "boolean",
        "label_en": "Are you or your spouse former or present holders of constitutional posts, MP, or MLA?",
        "label_hi": "क्या आप या आपके जीवनसाथी संवैधानिक पद धारक, सांसद या विधायक (पूर्व या वर्तमान) हैं?",
        "required": False,
        "tooltip_en": "Disqualifying exclusion under Central Sector guidelines.",
        "tooltip_hi": "केंद्रीय क्षेत्र दिशा-निर्देशों के तहत अपात्रता शर्त।"
    },

    # -------------------------------------------------------------
    # Category: Higher Education & Merit
    # -------------------------------------------------------------
    {
        "id": "q_percentile",
        "field": "percentile_score",
        "category": "education",
        "type": "number",
        "label_en": "Class 12 Board Exam Percentile Score (if applicable)",
        "label_hi": "12वीं बोर्ड परीक्षा परसेंटाइल स्कोर (यदि लागू हो)",
        "min": 0,
        "max": 100,
        "required": False,
        "tooltip_en": "Central Sector Scholarship (CSSS) requires > 80th percentile.",
        "tooltip_hi": "केंद्रीय क्षेत्र छात्रवृत्ति (CSSS) हेतु 80 से अधिक परसेंटाइल आवश्यक है।"
    },
    {
        "id": "q_regular_college",
        "field": "is_regular_college_student",
        "category": "education",
        "type": "boolean",
        "label_en": "Are you enrolled in a regular (non-distance) higher education degree course?",
        "label_hi": "क्या आप नियमित (नॉन-डिस्टेंस) उच्च शिक्षा डिग्री पाठ्यक्रम में नामांकित हैं?",
        "required": False,
        "tooltip_en": "Distance / correspondence courses are ineligible for CSSS.",
        "tooltip_hi": "पत्राचार / दूरस्थ शिक्षा पाठ्यक्रम सीएसएसएस के पात्र नहीं हैं।"
    }
]


def get_all_questions() -> List[Dict[str, Any]]:
    """Returns the complete standardized question catalog."""
    return ELIGIBILITY_QUESTIONS
