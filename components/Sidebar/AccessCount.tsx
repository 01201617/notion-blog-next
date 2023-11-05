"use client";

import React, { useEffect, useState } from "react";
import { countUp, getAccess } from "../../lib/awsAPI";

const AccessCount = ({ slug }: { slug: string }) => {
  const [access, setAccess] = useState(0);
  useEffect(() => {
    countUp(slug);

    const fetchData = async () => {
      const access = await getAccess(slug);
      setAccess(access);
    };

    fetchData();
  }, []);
  return <div>Access: {access}</div>;
};

export default AccessCount;
