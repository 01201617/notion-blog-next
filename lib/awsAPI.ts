const API_URL_PREFIX = process.env.LAMBDA_ENDPOINT

export const countUp =async (slug:string) => {
  const requestBody = {
    slug: slug
}

await fetch(API_URL_PREFIX + "/countUp",{
    method: "PUT",
    body: JSON.stringify(requestBody)
})
}
export const getAccess =async (slug:string) => {
  const response = await fetch(API_URL_PREFIX + `/get-access?slug=${slug}`,{
    method: "GET"
  })
  // const response = await fetch(API_URL_PREFIX + "/get-access")
  const responseBody = await response.json()
  console.log(responseBody)
      
  return responseBody.access
}