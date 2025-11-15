import { useEffect, useState } from "react";
import LayoutSection from "../../components/LayoutSection";

const mockAPIPath = "https://mp8bf9c8afc3b244affc.free.beeceptor.com";

const getXMLData = async ({ onSuccess, onError }: any) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", mockAPIPath);
  xhr.onload = () => {
    if (xhr.status >= 200) {
      onSuccess(xhr.responseText);
      return xhr.responseXML;
    }
  };

  xhr.onerror = () => {
    console.error("Error fetching XML data");
    onError(xhr.statusText);
  };

  xhr.send();
};

const ViewAJAX = () => {
  const [hello, setHello] = useState("");

  const handleFetchData = () => {
    getXMLData({
      onSuccess: (data: string) => {
        console.log("XML Data:", data);
        setHello(data);
      },
      onError: (error: string) => {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <LayoutSection>
      <div className="text-gray-100">{hello}</div>
    </LayoutSection>
  );
};

export default ViewAJAX;
