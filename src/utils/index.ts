export const isValidURL = (url: string) => {
  var res = url.match(/https|http|www|tiktok\.com/);
  return (res !== null)
};

export const downloadLink = (id: string) => {
  return `https://tikcdn.io/ssstik/${id}`;
}

export const formatTime = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  return formattedDate;
}

export const downloadVideo = async (url: string) => {
  try {
    const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading video:', error);
  }
}