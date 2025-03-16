document.addEventListener("DOMContentLoaded", () => {
  const sheetSelect = document.getElementById("sheetSelect");
  const searchInput = document.getElementById("searchInput");
  const typeSelect = document.getElementById("typeSelect");
  const searchButton = document.getElementById("searchButton");
  const clearButton = document.getElementById("clearButton");
  const columnCountBox = document.getElementById("columnCountBox");
  const columnCount = document.getElementById("columnCount");
  const priceResult = document.getElementById("priceResult");
  const articleResult = document.getElementById("articleResult");
  const engravingResult = document.getElementById("engravingResult");
  const dimensionsResult = document.getElementById("dimensionsResult");
  const pictureResult = document.getElementById("pictureResult");
  const resultBox = document.getElementById("resultBox");
  const loading = document.getElementById("loading");

  const tireCount = document.getElementById("tireCount");
  const discount25Button = document.getElementById("discount25Button");
  const customDiscountInput = document.getElementById("customDiscountInput");
  const customDiscountButton = document.getElementById("customDiscountButton");
  const discountValue = document.getElementById("discountValue");
  const finalPrice = document.getElementById("finalPrice");

  let sheetsData = {}; // تخزين بيانات جميع الأوراق
  let currentPrice = 0; // تخزين السعر الحالي للإطار

  // تحميل أسماء الأوراق
  async function fetchSheetInfo() {
    try {
      const response = await fetch(`https://script.google.com/macros/s/AKfycbwthTvqGiHsOTDN8SXbvQ6wKUh89u7XFcE7fzy3B3rEffTbplpMlTdGBpN6QJEGKLgjNA/exec?getSheets=true`);
      const result = await response.json();

      if (result.sheets) {
        // تحديث قائمة الأوراق
        sheetSelect.innerHTML = '<option value="">-- اختر الورقة --</option>';
        result.sheets.forEach(sheetName => {
          const option = document.createElement("option");
          option.value = sheetName;
          option.textContent = sheetName;
          sheetSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("خطأ في تحميل معلومات الشيت:", error);
      alert("حدث خطأ أثناء تحميل معلومات الشيت.");
      loading.classList.add("hidden");
    }
  }

  // تحميل البيانات من Google Apps Script
  async function fetchData(sheetName) {
    try {
      const response = await fetch(`https://script.google.com/macros/s/AKfycbwthTvqGiHsOTDN8SXbvQ6wKUh89u7XFcE7fzy3B3rEffTbplpMlTdGBpN6QJEGKLgjNA/exec?sheet=${sheetName}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      alert("حدث خطأ أثناء تحميل البيانات.");
      loading.classList.add("hidden");
      return [];
    }
  }

  // تحديث قائمة الأنواع حسب المقاس المدخل
  function updateTypeOptions(data, searchTerm = '') {
    typeSelect.innerHTML = '<option value="">-- اختر النوع --</option>';
    
    if (searchTerm) {
      // فلترة البيانات حسب المقاس المدخل
      const filteredData = data.filter(item => 
        String(item.dimensions).includes(searchTerm)
      );
      
      // استخراج الأنواع الفريدة المتوفرة للمقاس
      const availableTypes = [...new Set(filteredData.map(item => item["Tire type"]))].filter(Boolean);
      
      if (availableTypes.length > 0) {
        availableTypes.forEach(type => {
          const option = document.createElement("option");
          option.value = type;
          option.textContent = type;
          typeSelect.appendChild(option);
        });
      }
    }
  }

  // تنفيذ البحث
  async function performSearch() {
    const sheetName = sheetSelect.value.trim();
    const searchTerm = searchInput.value.trim();
    const selectedType = typeSelect.value.trim();

    if (!sheetName) {
      alert("يرجى اختيار الورقة.");
      return;
    }

    // تحميل البيانات إذا لم تكن متوفرة
    if (!sheetsData[sheetName]) {
      sheetsData[sheetName] = await fetchData(sheetName);
    }

    // البحث عن النتائج
    const results = sheetsData[sheetName].filter(item => {
      const matchesSearch = Object.values(item).some(value => String(value).includes(searchTerm));
      const matchesType = selectedType ? item["Tire type"] === selectedType : true;
      return matchesSearch && matchesType;
    });

    if (results.length > 0) {
      const result = results[0];
      dimensionsResult.textContent = result.dimensions || "غير متاح";
      priceResult.textContent = result.price || "غير متاح";
      articleResult.textContent = result.Article || "غير متاحة";
      engravingResult.textContent = result.engraving || "غير متاح";

      // عرض الصورة إذا كانت موجودة
      if (result.picture) {
        const directLink = result.picture.replace("file/d/", "uc?id=").split("/view")[0];
        pictureResult.src = directLink;
        pictureResult.style.display = "block";
      } else {
        pictureResult.style.display = "none";
      }

      // تخزين السعر الحالي
      currentPrice = parseFloat(result.price) || 0;

      resultBox.classList.remove("hidden");
    } else {
      dimensionsResult.textContent = "غير متاح";
      priceResult.textContent = "غير متاح";
      articleResult.textContent = "غير متاحة";
      engravingResult.textContent = "غير متاح";
      pictureResult.style.display = "none";
      resultBox.classList.add("hidden");
    }
  }

  // حساب الخصم بنسبة 25%
  discount25Button.addEventListener("click", () => {
    const numberOfTires = parseInt(tireCount.value, 10) || 1;
    const totalOriginalPrice = currentPrice * numberOfTires;
    const discountAmount = totalOriginalPrice * 0.25;
    const discountedPrice = totalOriginalPrice - discountAmount;

    discountValue.textContent = discountAmount.toFixed(2);
    finalPrice.textContent = discountedPrice.toFixed(2);
  });

  // حساب الخصم المخصص
  customDiscountButton.addEventListener("click", () => {
    const numberOfTires = parseInt(tireCount.value, 10) || 1;
    const discountPercentage = parseFloat(customDiscountInput.value) || 0;

    if (discountPercentage < 0 || discountPercentage > 100) {
      alert("يرجى إدخال نسبة خصم بين 0 و 100.");
      return;
    }

    const totalOriginalPrice = currentPrice * numberOfTires;
    const discountAmount = (totalOriginalPrice * discountPercentage) / 100;
    const discountedPrice = totalOriginalPrice - discountAmount;

    discountValue.textContent = discountAmount.toFixed(2);
    finalPrice.textContent = discountedPrice.toFixed(2);
  });

  // مسح الحقول
  function clearFields() {
    searchInput.value = "";
    typeSelect.value = "";
    dimensionsResult.textContent = "غير متاح";
    priceResult.textContent = "غير متاح";
    articleResult.textContent = "غير متاحة";
    engravingResult.textContent = "غير متاح";
    pictureResult.style.display = "none";
    discountValue.textContent = "0";
    finalPrice.textContent = "0";
    resultBox.classList.add("hidden");
  }

  // أحداث الأزرار
  searchButton.addEventListener("click", performSearch);
  clearButton.addEventListener("click", clearFields);

  // دالة المزامنة التلقائية
  async function autoSync(sheetName) {
    if (sheetName) {
      sheetsData[sheetName] = await fetchData(sheetName);
      console.log("تم تحديث البيانات تلقائياً");
    }
  }

  // تحديث الأنواع عند تغيير نص البحث
  searchInput.addEventListener("input", () => {
    const sheetName = sheetSelect.value.trim();
    const searchTerm = searchInput.value.trim();
    if (sheetName && sheetsData[sheetName]) {
      updateTypeOptions(sheetsData[sheetName], searchTerm);
    }
  });

  // تحميل الأنواع عند تغيير ورقة العمل
  sheetSelect.addEventListener("change", async () => {
    const sheetName = sheetSelect.value.trim();
    if (sheetName) {
      // مزامنة تلقائية عند تغيير الورقة
      await autoSync(sheetName);
      const data = sheetsData[sheetName];

      // فحص الأعمدة وحساب عدد الأعمدة التي تحتوي على المسميات الرئيسية
      const headers = Object.keys(data[0] || {});
      const mainColumns = ["Article", "dimensions", "price", "Tire type", "engraving", "picture"];
      const matchedColumns = headers.filter(header =>
        mainColumns.some(mainColumn => header.includes(mainColumn))
      );

      // تحديث مربع عرض عدد الأعمدة
      columnCount.textContent = matchedColumns.length;
      columnCountBox.classList.remove("hidden");

      // تحديث قائمة الأنواع بناءً على العمود "Tire type"
      const tireTypes = data.flatMap(item => item[matchedColumns.find(col => col.includes("Tire type"))]).filter(Boolean);
      updateTypeOptions([...new Set(tireTypes)]);
    } else {
      columnCountBox.classList.add("hidden");
    }
  });

  // تحميل معلومات الشيت عند بدء التطبيق
  fetchSheetInfo();
  
  // إعداد مزامنة تلقائية كل 5 دقائق (300000 مللي ثانية)
  setInterval(() => {
    const currentSheet = sheetSelect.value.trim();
    if (currentSheet) {
      autoSync(currentSheet);
    }
  }, 300000);
});